use std::{fs::{self, File}, io::BufWriter, path::PathBuf, str::FromStr};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::shared::{
    config::{ODConfig, META_DIRNAME},
    types::{interfaces::Shared, meta::VarToPhylum},
};

pub struct FileMetaDao<C: ODConfig> {
    config: Shared<C>,
}

pub trait MetaDao<C: ODConfig> {
    fn get_var_to_phylum_map(&self, project_id: &str) -> Result<VarToPhylum>;
    fn save_var_to_phylum(&self,project_id: &str, vars: VarToPhylum) -> Result<()>;
}

impl<C: ODConfig> MetaDao<C> for FileMetaDao<C> {
    fn get_var_to_phylum_map(&self, project_id: &str) -> Result<VarToPhylum> {
        Ok(self
            .get_meta_fk_var_dialogs_path(project_id)
            .map(|path| fs::read(&path))
            .context("could not read character file")?
            .map(|b| serde_json::from_slice(&b))
            .context("could not deserialize file into meta struct.")??)
    }

    fn save_var_to_phylum(&self,project_id: &str, vars: VarToPhylum) -> Result<()> {
        Ok(self
            .get_meta_fk_var_dialogs_path(project_id)
            .map(|cp| File::create(cp))
            .context("error creating the character file")?
            .map(|file| BufWriter::new(file))
            .map(|writer| serde_json::to_writer(writer, &vars))
            .context("could not serialize character to write into file")??)
    }
}

impl<C: ODConfig> FileMetaDao<C> {
    pub fn new(config: Shared<C>) -> Self {
        Self { config }
    }

    fn get_meta_dir(&self, project_id: &str) -> Result<PathBuf> {
        let project_path = &Uuid::from_str(project_id)?.simple().to_string()[..12];
        Ok(self
            .config
            .lock()?
            .get_root_dir()
            .join(project_path)
            .join(META_DIRNAME))
    }

    fn get_meta_fk_var_dialogs_path(&self, project_id: &str) -> Result<PathBuf> {
        Ok(self.get_meta_dir(project_id)?.join("vars_dialogs.json"))
    }
}
