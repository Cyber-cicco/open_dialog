use std::{str::FromStr, sync::Arc};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::{
    pkg::character::dao::CharacterDao,
    shared::{
        config::ODConfig,
        types::{
            character::{Character, CharacterForm, ImageField},
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

    pub fn create_character(&self, project_id: &str, name: &str) -> Result<Character> {
        let character = Character::new(name)?;
        self.dao.persist_character(project_id, &character)?;
        Ok(character)
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
        self.dao.persist_character(project_id, &character)?;
        Ok(character)
    }

    fn persist_description(
        &self,
        project_id: &str,
        character: &mut Character,
        description: &str,
    ) -> Result<()> {
        let description_uuid = character.get_description_link()
            .unwrap_or(Uuid::new_v4());
        self.dao.persist_description(project_id, &description_uuid, description)?;
        character.set_description_link(description_uuid);
        character.set_description(description);
        Ok(())
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
        character.upload_image(from, &project_path, self.uploader.clone(), field)?;
        self.dao.persist_character(project_id, &character)
    }

    pub fn get_all_characters(&self, project_id: &str) -> Result<Vec<Character>> {
        self.dao.get_all_characters(project_id)
    }
}
