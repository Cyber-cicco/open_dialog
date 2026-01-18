use std::{
    fs,
    sync::{Arc, Mutex},
};

use anyhow::{anyhow, Ok, Result};
use git2::Repository;

use crate::shared::{
    config::{ODConfig, ASSETS_DIRNAME, CHAR_DIRNAME, DIALOG_DIRNAME, STATS_DIRNAME},
    types::project::{AtomicProject, AtomicProjects, Project},
};

pub struct ProjectServiceLocaleImpl<C: ODConfig> {
    config: Arc<Mutex<C>>,
}

// service.rs
impl<C: ODConfig> ProjectServiceLocaleImpl<C> {
    pub fn new(config: Arc<Mutex<C>>) -> Self {
        ProjectServiceLocaleImpl { config }
    }

    pub fn post_project(&mut self, name: &str) -> Result<AtomicProject> {
        let project = Project::new(
            name,
            &self
                .config
                .lock()
                .map_err(|e| anyhow!("config lock error {e}"))?
                .get_root_dir(),
        );
        for dir in [CHAR_DIRNAME, DIALOG_DIRNAME, STATS_DIRNAME, ASSETS_DIRNAME] {
            fs::create_dir_all(project.get_path().join(dir))?;
        }
        Repository::init(project.get_path())?;
        let res = self
            .config
            .lock()
            .map_err(|e| anyhow!("config lock error {e}"))?
            .append_project(project)?;
        self.save_config()?;
        Ok(res)
    }

    pub fn get_projects(&self) -> Result<AtomicProjects> {
        Ok(self
            .config
            .lock()
            .map_err(|e| anyhow!("config lock error {e}"))?
            .get_projects())
    }

    fn save_config(&self) -> Result<()> {
        let config_clone = self
            .config
            .lock()
            .map_err(|e| anyhow!("config lock error {e}"))?
            .clone();
        tauri::async_runtime::spawn(async move {
            if let Err(e) = config_clone.save_async().await {
                eprintln!("Failed to save config: {e}");
            }
        });
        Ok(())
    }
}
