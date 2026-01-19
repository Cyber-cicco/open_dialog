use std::{
    fs::{self, File},
    io::BufWriter,
    path::PathBuf,
    str::FromStr,
};

use anyhow::{bail, Context, Ok, Result};
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
    fn get_all_characters(&self, project_id: &str) -> Result<Vec<Character>>;
    fn enforce_character_existence(&self, project_id: &str, char_id: &Uuid) -> Result<()>;
}

impl<C: ODConfig> CharacterDao<C> for FileCharacterDao<C> {
    fn persist_character(&self, project_id: &str, character: &Character) -> Result<()> {
        Ok(self
            .get_char_path(project_id, character.get_id())
            .map(|cp| File::create(cp))
            .context("error creating the character file")?
            .map(|file| BufWriter::new(file))
            .map(|writer| serde_json::to_writer(writer, &character))
            .context("could not serialize character to write into file")??)
    }

    fn get_character(&self, project_id: &str, char_id: &Uuid) -> Result<Character> {
        Ok(self
            .get_char_path(project_id, char_id)
            .map(|path| fs::read(&path))
            .context("could not read character file")?
            .map(|b| serde_json::from_slice(&b))
            .context("could not deserialize file into character.")??)
    }

    fn persist_description(&self, project_id: &str, desc_id: &Uuid, desc: &str) -> Result<()> {
        Ok(self
            .get_desc_file_name(project_id, desc_id)
            .map(|dfs| fs::write(dfs, desc))
            .context("could not write description to file")??)
    }

    fn get_all_characters(&self, project_id: &str) -> Result<Vec<Character>> {
        let char_dir = self.get_char_dir(project_id)?;
        let mut res: Vec<Character> = fs::read_dir(&char_dir)
            .context("Could not access this character directory")?
            .filter_map(|entry| entry.ok())
            .map(|e| e.path())
            .filter(|path| path.extension().is_some_and(|ext| ext == "char"))
            .filter_map(|path| {
                fs::read(&path)
                    .ok()
                    .and_then(|data| serde_json::from_slice(&data).ok())
                    .or_else(|| {
                        eprintln!("character file was corrupted: {}", path.display());
                        None
                    })
            })
            .collect();
        for character in &mut res {
            let dl_opt = character.get_description_link();
            let dl = match dl_opt {
                Some(dl) => dl,
                None => continue,
            };
            let desc_file_path = self.get_desc_file_name(project_id, &dl)?;
            let file = fs::read_to_string(desc_file_path)?;
            character.set_description(&file);
        }
        Ok(res)
    }

    fn enforce_character_existence(&self, project_id: &str, char_id: &Uuid) -> Result<()> {
        let char_path = self.get_char_path(project_id, char_id)?;
        if fs::exists(char_path)? {
            return Ok(());
        } else {
            bail!("char {char_id} did not exist")
        }
    }
}

impl<C: ODConfig> FileCharacterDao<C> {
    pub fn new(config: Shared<C>) -> Self {
        FileCharacterDao { config }
    }

    pub fn get_char_path(&self, project_id: &str, char_id: &Uuid) -> Result<PathBuf> {
        let character_file_name = &char_id.simple().to_string()[..16];
        Ok(self
            .get_char_dir(project_id)?
            .join(format!("{character_file_name}.char")))
    }

    pub fn get_desc_file_name(&self, project_id: &str, desc_id: &Uuid) -> Result<PathBuf> {
        let desc_file_name = &desc_id.simple().to_string()[..16];
        Ok(self
            .get_char_dir(project_id)?
            .join(format!("{desc_file_name}.desc")))
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
