use std::{
    fs::File,
    io::BufWriter,
    str::FromStr,
    sync::{Arc, Mutex},
};

use anyhow::{anyhow, Context, Result};
use uuid::Uuid;

use crate::shared::{
    config::{CHAR_DIRNAME, ODConfig},
    types::{character::Character, interfaces::{Shared, Uploader}},
};

pub struct CharacterServiceLocalImpl<C: ODConfig> {
    config:Shared<C>,
    uploader: Arc<dyn Uploader>,
}

impl<C: ODConfig> CharacterServiceLocalImpl<C> {
    pub fn new(config: Shared<C>, uploader: Arc<dyn Uploader>) -> Self {
        CharacterServiceLocalImpl { config, uploader }
    }

    pub fn create_character(&self, project_id: &str, name: &str) -> Result<Character> {
        let character = Character::new(name)?;
        let project_path = &Uuid::from_str(project_id)?.simple().to_string()[..12];
        let char_path = self
            .config
            .lock()
            .map_err(|e| anyhow!("config lock error {e}"))?
            .get_root_dir()
            .join(project_path)
            .join(CHAR_DIRNAME)
            .join(character.get_file_name());
        let file = File::create(char_path).context("error creating the character file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &character)
            .context("could not serialize character to write into file")?;
        Ok(character)
    }

}
