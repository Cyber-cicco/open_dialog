use std::{fs::File, io::BufWriter, path::PathBuf, str::FromStr};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::shared::{config::{CHAR_DIRNAME, ODConfig}, types::{character::Character, interfaces::Shared}};

pub struct FileCharacterDao<C: ODConfig> {
    config: Shared<C>,
}

pub trait CharacterDao<C: ODConfig> {
    fn create_character<'a>(&'a self, project_id: &'a str, character:&'a Character) -> Result<&'a Character>;
}

impl<C:ODConfig> CharacterDao<C> for FileCharacterDao<C>  {
    fn create_character<'a>(&'a self, project_id: &'a str, character:&'a Character) -> Result<&'a Character> {
        let char_path = self.get_char_path(project_id, character.get_id())?;
        let file = File::create(char_path).context("error creating the character file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &character)
            .context("could not serialize character to write into file")?;
        Ok(character)
    }
}

impl<C:ODConfig> FileCharacterDao<C> {

    pub fn new(config: Shared<C>) -> Self {
        FileCharacterDao { config }
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
}
