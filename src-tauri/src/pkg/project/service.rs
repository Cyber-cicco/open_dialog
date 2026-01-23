use std::{fs, io::BufWriter};

use anyhow::{Context, Ok, Result};
use git2::Repository;
use serde::{Deserialize, Serialize};

use crate::shared::{
    config::{ASSETS_DIRNAME, CHAR_DIRNAME, DIALOG_DIRNAME, DIALOG_META, META_DIRNAME, META_FK_VARS_DIALOGS, ODConfig, STATS_DIRNAME, VARS},
    types::{
        dialog::DialogMetadata, interfaces::Shared, meta::VarToPhylum, project::{AtomicProject, AtomicProjects, Project}, variables::VariableStore
    },
};

pub struct ProjectServiceLocaleImpl<C: ODConfig> {
    config: Shared<C>,
}

// service.rs
impl<C: ODConfig> ProjectServiceLocaleImpl<C> {
    pub fn new(config: Shared<C>) -> Self {
        ProjectServiceLocaleImpl { config }
    }

    fn save_file<'a, T:Serialize>(&self, project:&'a Project, path:&'a str, content: &'a T) -> Result<()> {
        let file = fs::File::create(project.get_path().join(path))?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, content).context("could not write to file")

    }

    pub fn create_project(&self, name: &str) -> Result<AtomicProject> {
        let project = Project::new(name, &self.config.lock()?.get_root_dir());
        for dir in [CHAR_DIRNAME, DIALOG_DIRNAME, STATS_DIRNAME, META_DIRNAME, ASSETS_DIRNAME] {
            fs::create_dir_all(project.get_path().join(dir))?;
        }

        self.save_file(&project, META_FK_VARS_DIALOGS, &VarToPhylum::new()).context("error creating meta var dialogs filek")?;
        self.save_file(&project, VARS, &VariableStore::new()).context("error creating vars file")?;
        self.save_file(&project, DIALOG_META, &DialogMetadata::new()).context("error creating dialog meta file")?;

        
        Repository::init(project.get_path())?;
        let res = self.config.lock()?.append_project(project)?;
        self.save_config()?;
        Ok(res)
    }

    pub fn get_projects(&self) -> Result<AtomicProjects> {
        Ok(self.config.lock()?.get_projects())
    }

    fn save_config(&self) -> Result<()> {
        let config_clone = self.config.lock()?.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(e) = config_clone.save_async().await {
                eprintln!("Failed to save config: {e}");
            }
        });
        Ok(())
    }
}
