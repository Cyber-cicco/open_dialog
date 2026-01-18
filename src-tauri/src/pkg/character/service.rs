use std::{
    fs::File, io::BufWriter, str::FromStr, sync::{Arc, Mutex}
};

use anyhow::{Context, Result, anyhow};
use uuid::Uuid;

use crate::shared::{
    config::{ODConfig, CHAR_DIRNAME},
    types::character::Character,
};

pub struct CharacterServiceLocalImpl<C: ODConfig> {
    config: Arc<Mutex<C>>,
}

impl<C: ODConfig> CharacterServiceLocalImpl<C> {
    pub fn new(config: Arc<Mutex<C>>) -> Self {
        CharacterServiceLocalImpl { config }
    }

    pub fn create_character(&self, project_id: &str, name: &str) -> Result<Character> {
        let character = Character::new(name)?;
        let project_uuid = &Uuid::from_str(project_id)?.simple().to_string()[..12];
        let char_path = self
            .config
            .lock()
            .map_err(|e| anyhow!("config lock error {e}"))?
            .get_root_dir()
            .join(project_uuid)
            .join(CHAR_DIRNAME)
            .join(character.get_file_name());
        let file = File::create(char_path).context("error creating the character file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &character)
            .context("could not serialize character to write into file")?;
        Ok(character)
    }
}
