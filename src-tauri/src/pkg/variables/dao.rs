use std::{fs::{self, File}, io::BufWriter, path::PathBuf, str::FromStr};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::shared::{
    config::ODConfig,
    types::{interfaces::Shared, variables::VariableStore},
};

pub struct FileVariableDao<C: ODConfig> {
    config: Shared<C>,
}

pub trait VariableDao<C: ODConfig> {
    fn persist_variables(&self, project_id: &str, vars: VariableStore) -> Result<()>;

    fn load_variables(&self, project_id: &str) -> Result<VariableStore>;
}

impl<C: ODConfig> VariableDao<C> for FileVariableDao<C> {
    fn persist_variables(&self, project_id: &str, vars: VariableStore) -> Result<()> {
        Ok(self
            .get_var_file_name(project_id)
            .map(|cp| File::create(cp))
            .context("error creating the variable file")?
            .map(|file| BufWriter::new(file))
            .map(|writer| serde_json::to_writer(writer, &vars))
            .context("could not serialize character to write into file")??)
    }

    fn load_variables(&self, project_id: &str) -> Result<VariableStore> {
        Ok(self
            .get_var_file_name(project_id)
            .map(|path| fs::read(&path))
            .context("could not read var file")?
            .map(|b| serde_json::from_slice(&b))
            .context("could not deserialize file into character.")??)

        
    }
}

impl<C: ODConfig> FileVariableDao<C> {
    pub fn new(config:Shared<C>) -> Self {
        Self { config }
    }

    fn get_var_file_name(&self, project_id: &str) -> Result<PathBuf> {
        let project_path = &Uuid::from_str(project_id)?.simple().to_string()[..12];
        Ok(self
            .config
            .lock()?
            .get_root_dir()
            .join(project_path)
            .join("vars.json"))
    }

}
