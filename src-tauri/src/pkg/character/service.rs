use std::{
    fs::File,
    io::BufWriter,
    path::PathBuf,
    str::FromStr,
    sync::{Arc},
};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::{pkg::character::dao::CharacterDao, shared::{
    config::{CHAR_DIRNAME, ODConfig},
    types::{
        character::Character,
        interfaces::{Shared, Uploader},
    },
}};

pub struct CharacterServiceLocalImpl<C: ODConfig, D: CharacterDao<C>> {
    config: Shared<C>,
    dao: Arc<D>,
    uploader: Arc<dyn Uploader>,
}

impl<C: ODConfig, D: CharacterDao<C>> CharacterServiceLocalImpl<C, D> {
    pub fn new(
        config: Shared<C>,
        dao: Arc<D>,
        uploader: Arc<dyn Uploader>,
    ) -> Self {
        CharacterServiceLocalImpl { config, uploader, dao }
    }

    pub fn create_character(&self, project_id: &str, name: &str) -> Result<Character> {
        let character = Character::new(name)?;
        let char_path = self.get_char_path(project_id, character.get_id())?;
        let file = File::create(char_path).context("error creating the character file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &character)
            .context("could not serialize character to write into file")?;
        Ok(character)
    }

    pub fn get_char_path(&self, project_id: &str, char_id: &Uuid) -> Result<PathBuf> {
        let character_file_name = &char_id.simple().to_string()[..16];
        let project_path = &Uuid::from_str(project_id)?.simple().to_string()[..12];
        Ok(self
            .config
            .lock()?
            .get_root_dir()
            .join(project_path)
            .join(CHAR_DIRNAME)
            .join(character_file_name))
    }

    fn create_description(&self, project_id: &str, char_id: &str, description: &str) -> Result<()> {
        Ok(())
    }
}
