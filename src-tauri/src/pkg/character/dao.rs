use std::{
    collections::HashSet,
    fs::{self, File},
    io::BufWriter,
    path::PathBuf,
    str::FromStr,
};

use anyhow::{bail, Context, Result};
use uuid::Uuid;

use crate::shared::{
    config::{ODConfig, CHAR_DIRNAME},
    types::{
        character::{Character, CharacterMetadata},
        interfaces::Shared,
    },
};

pub struct FileCharacterDao<C: ODConfig> {
    config: Shared<C>,
}

pub trait CharacterDao<C: ODConfig> {
    fn persist_character(&self, project_id: &str, character: &Character) -> Result<()>;
    fn get_character(&self, project_id: &str, char_id: &Uuid) -> Result<Character>;
    fn persist_description(&self, project_id: &str, desc_id: &Uuid, desc: &str) -> Result<()>;
    fn get_character_identifiers(&self, project_id: &str) -> Result<HashSet<Uuid>>;
    fn enforce_character_existence(&self, project_id: &str, char_id: &Uuid) -> Result<()>;
    fn get_meta_file(&self, project_id: &str) -> Result<CharacterMetadata>;
    fn save_metadata(&self, project_id: &str, metadata: CharacterMetadata) -> Result<()>;
    fn delete_character_by_id(&self, project_id: &str, char_id: &Uuid) -> Result<()>;
}

impl<C: ODConfig> CharacterDao<C> for FileCharacterDao<C> {
    fn delete_character_by_id(&self, project_id: &str, char_id: &Uuid) -> Result<()> {
        let char = self.get_character(project_id, char_id)?;
        match char.get_description_link() {
            Some(d) => {
                let desc_file_name = self.get_desc_file_name(project_id, &d)?;
                fs::remove_file(desc_file_name)
                    .context("could not delete description file of character to be deleted")?;
            }
            None => {}
        }
        let char_path = self.get_char_path(project_id, char_id)?;
        fs::remove_file(char_path).context("could not delete file of character")
    }

    fn save_metadata(&self, project_id: &str, metadata: CharacterMetadata) -> Result<()> {
        Ok(self
            .get_char_dir(project_id)
            .map(|cp| File::create(cp.join("meta.json")))
            .context("error creating the metadata file")?
            .map(|file| BufWriter::new(file))
            .map(|writer| serde_json::to_writer(writer, &metadata))
            .context("could not serialize character to write into file")??)
    }

    fn get_meta_file(&self, project_id: &str) -> Result<CharacterMetadata> {
        Ok(fs::read(self.get_char_dir(project_id)?.join("meta.json"))
            .context("could not read character file")
            .map(|b| serde_json::from_slice(&b))
            .context("could not deserialize file into character metadata.")??)
    }
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
        let mut character: Character = self
            .get_char_path(project_id, char_id)
            .map(|path| fs::read(&path))
            .context("could not read character file")?
            .map(|b| serde_json::from_slice(&b))
            .context("could not deserialize file into character.")??;
        let dl_opt = character.get_description_link();
        match dl_opt {
            Some(dl) => {
                let desc_file_path = self.get_desc_file_name(project_id, &dl)?;
                let file = fs::read_to_string(desc_file_path)?;
                character.set_description(&file);
            }
            None => (),
        };
        Ok(character)
    }

    fn persist_description(&self, project_id: &str, desc_id: &Uuid, desc: &str) -> Result<()> {
        Ok(self
            .get_desc_file_name(project_id, desc_id)
            .map(|dfs| fs::write(dfs, desc))
            .context("could not write description to file")??)
    }

    fn enforce_character_existence(&self, project_id: &str, char_id: &Uuid) -> Result<()> {
        let char_path = self.get_char_path(project_id, char_id)?;
        if fs::exists(char_path)? {
            return Ok(());
        } else {
            bail!("char {char_id} did not exist")
        }
    }

    fn get_character_identifiers(&self, project_id: &str) -> Result<HashSet<Uuid>> {
        let char_dir = self.get_char_dir(project_id)?;
        let dir_entries = fs::read_dir(char_dir)?;
        let res = dir_entries
            .filter_map(|entry| entry.ok())
            .filter(|path| path.path().extension().is_some_and(|e| e == "char"))
            .filter_map(|e| e.path().file_stem()?.to_str().map(String::from))
            .map(|name| Uuid::from_str(&name).context("could not create uuid from string {name}"))
            .collect::<Result<HashSet<Uuid>>>()?;
        return Ok(res);
    }
}

impl<C: ODConfig> FileCharacterDao<C> {
    pub fn new(config: Shared<C>) -> Self {
        FileCharacterDao { config }
    }

    pub fn get_char_path(&self, project_id: &str, char_id: &Uuid) -> Result<PathBuf> {
        let character_file_name = &char_id.to_string();
        Ok(self
            .get_char_dir(project_id)?
            .join(format!("{character_file_name}.char")))
    }

    pub fn get_desc_file_name(&self, project_id: &str, desc_id: &Uuid) -> Result<PathBuf> {
        let desc_file_name = &desc_id.to_string();
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
