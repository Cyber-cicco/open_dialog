use std::{
    fs::{self, File},
    io::{BufWriter},
    path::PathBuf,
    str::FromStr,
};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::shared::{
    config::{ODConfig, CHAR_DIRNAME},
    types::{character::Character, interfaces::Shared},
};

pub struct FileCharacterDao<C: ODConfig> {
    config: Shared<C>,
}

pub trait CharacterDao<C: ODConfig> {
    fn persist_character(&self, project_id: &str, character: &Character) -> Result<()>;
    fn get_character(&self, project_id: &str, char_id: &Uuid) -> Result<Character>;
    fn persist_description(&self, project_id: &str, desc_id: &Uuid, desc: &str) -> Result<()>;
}

impl<C: ODConfig> CharacterDao<C> for FileCharacterDao<C> {
    fn persist_character(&self, project_id: &str, character: &Character) -> Result<()> {
        let char_path = self.get_char_path(project_id, character.get_id())?;
        let file = File::create(char_path).context("error creating the character file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &character)
            .context("could not serialize character to write into file")?;
        Ok(())
    }

    fn get_character(&self, project_id: &str, char_id: &Uuid) -> Result<Character> {
        let char_path = self.get_char_path(project_id, char_id)?;
        let file = fs::read(char_path).context("character did not exist")?;
        let character: Character =
            serde_json::from_slice(&file).context("could not deserialize file into character.")?;
        Ok(character)
    }

    fn persist_description(&self, project_id: &str, desc_id: &Uuid, desc: &str) -> Result<()> {
        let desc_path = self.get_desc_file_name(project_id, desc_id)?;
        fs::write(desc_path, desc).context("could not write description to file")?;
        Ok(())
    }
}

impl<C: ODConfig> FileCharacterDao<C> {
    pub fn new(config: Shared<C>) -> Self {
        FileCharacterDao { config }
    }

    pub fn get_char_path(&self, project_id: &str, char_id: &Uuid) -> Result<PathBuf> {
        let character_file_name = &char_id.simple().to_string()[..16];
        Ok(self.get_char_dir(project_id)?.join(character_file_name))
    }

    pub fn get_desc_file_name(&self, project_id: &str, desc_id: &Uuid) -> Result<PathBuf> {
        let desc_file_name = &desc_id.simple().to_string()[..16];
        Ok(self
            .get_char_dir(project_id)?
            .join(format!("desc-{desc_file_name}.txt")))
    }

    pub fn get_char_dir(&self, project_id: &str) -> Result<PathBuf> {
        let project_path = &Uuid::from_str(project_id)?.simple().to_string()[..12];
        Ok(self
            .config
            .lock()?
            .get_root_dir()
            .join(project_path)
            .join(CHAR_DIRNAME))
    }
}
