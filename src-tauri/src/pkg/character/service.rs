use std::{fs::File, io::BufWriter, str::FromStr};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::shared::{
    config::{CHAR_DIRNAME, ODConfig},
    types::{character::Character, interfaces::Uploader},
};

pub struct CharacterServiceLocalImpl<'a, U: Uploader, C: ODConfig> {
    uploader: &'a U,
    config: &'a mut C,
}

impl<'a, U: Uploader, C: ODConfig> CharacterServiceLocalImpl<'a, U, C> {
    pub fn new(uploader: &'a U, config: &'a mut C) -> Self {
        CharacterServiceLocalImpl { uploader, config }
    }

    pub fn create_character(&self, project_id: &str, name: &str) -> Result<Character> {
        let character = Character::new(name)?;
        let project_uuid = &Uuid::from_str(project_id)?
            .simple()
            .to_string()[..12];
        let char_path = self.config
            .get_root_dir()
            .join(project_uuid)
            .join(CHAR_DIRNAME)
            .join(character.get_file_name());
        let file = File::create(char_path)
            .context("error creating the character file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &character)
            .context("could not serialize character to write into file")?;
        Ok(character)
    }

}
