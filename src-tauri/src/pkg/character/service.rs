use std::{str::FromStr, sync::Arc};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::{
    pkg::character::{self, dao::CharacterDao},
    shared::{
        config::ODConfig,
        types::{
            character::{Character, CharacterForm, CharacterMetadata, ImageField, SimpleCharacter},
            interfaces::{Shared, Uploader},
        },
    },
};

pub struct CharacterServiceLocalImpl<C: ODConfig, D: CharacterDao<C>> {
    config: Shared<C>,
    dao: Arc<D>,
    uploader: Arc<dyn Uploader>,
}

impl<C: ODConfig, D: CharacterDao<C>> CharacterServiceLocalImpl<C, D> {
    pub fn new(config: Shared<C>, dao: Arc<D>, uploader: Arc<dyn Uploader>) -> Self {
        CharacterServiceLocalImpl {
            config,
            uploader,
            dao,
        }
    }

    pub fn create_character(
        &self,
        project_id: &str,
        name: &str,
        order: usize,
    ) -> Result<Character> {
        let character = Character::new(name)?;
        let simple_char = SimpleCharacter::from_character(&character, order);
        let mut metadata = self.dao.get_meta_file(project_id)?;
        metadata.persist_character(simple_char);
        self.dao.persist_character(project_id, &character)?;
        self.dao.save_metadata(project_id, metadata)?;
        Ok(character)
    }

    pub fn persist_metadata(&self, project_id: &str, metadata: CharacterMetadata) -> Result<()> {
        let old = self.dao.get_meta_file(project_id)?;
        old.enforce_characters_unchanged(&metadata)?;
        self.dao.save_metadata(project_id, metadata)
    }

    pub fn change_character(
        &self,
        project_id: &str,
        char_form: CharacterForm,
    ) -> Result<Character> {
        let char_uuid = Uuid::from_str(char_form.id)?;
        let mut character = self.dao.get_character(project_id, &char_uuid)?;
        match &char_form.description {
            Some(desc) => self.persist_description(project_id, &mut character, &desc)?,
            None => (),
        }
        Character::validate_name(character.get_name())?;
        character.change_from_form(&char_form);
        self.update_metadata(project_id, &char_uuid, &character)?;
        self.dao.persist_character(project_id, &character)?;
        Ok(character)
    }

    fn persist_description(
        &self,
        project_id: &str,
        character: &mut Character,
        description: &str,
    ) -> Result<()> {
        let description_uuid = character.get_description_link().unwrap_or(Uuid::new_v4());
        self.dao
            .persist_description(project_id, &description_uuid, description)?;
        character.set_description_link(description_uuid);
        character.set_description(description);
        Ok(())
    }

    fn update_metadata(&self, project_id: &str, char_uuid:&Uuid, character: &Character) -> Result<()> {
        let mut metadata = self.dao.get_meta_file(project_id)?;
        let old_simple_char = metadata.get_character_by_id(char_uuid)?;
        let new_simple_char =
            SimpleCharacter::from_character(&character, old_simple_char.get_order());
        metadata.persist_character(new_simple_char);
        self.dao.save_metadata(project_id, metadata)
    }

    pub fn upload_image(
        &self,
        project_id: &str,
        char_id: &str,
        from: &str,
        field: ImageField,
    ) -> Result<()> {
        let char_uuid = Uuid::from_str(char_id).context(format!("invalid uuid {char_id}"))?;
        let mut character = self.dao.get_character(project_id, &char_uuid)?;
        let project_path = self.config.lock()?.get_project_dir(project_id)?;
        match field {
            ImageField::Portrait => {
                self.update_metadata(project_id, &char_uuid, &character)?
            }
            ImageField::Artwork => {}
            ImageField::Background => {}
        }
        character.upload_image(from, &project_path, self.uploader.clone(), field)?;
        self.dao.persist_character(project_id, &character)
    }


    pub fn get_all_characters(&self, project_id: &str) -> Result<CharacterMetadata> {
        self.dao.get_meta_file(project_id)
    }

    pub fn get_character_by_id(&self, project_id: &str, character_id:Uuid) -> Result<Character> {
        self.dao.get_character(project_id, &character_id)
    }
}
