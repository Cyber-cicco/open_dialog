use std::fs;

use anyhow::{anyhow, Context, Result};
use git2::Repository;

use crate::shared::{
    config::{ODConfig, ASSETS_DIRNAME, CHAR_DIRNAME, DIALOG_DIRNAME, STATS_DIRNAME},
    types::{
        interfaces::Uploader,
        project::{AtomicProject, AtomicProjects, Project},
    },
};

pub struct ProjectServiceLocaleImpl<U: Uploader, C: ODConfig> {
    uploader: U,
    config: C,
}

// service.rs
impl<U: Uploader, C: ODConfig> ProjectServiceLocaleImpl<U, C> {
    pub fn new(uploader: U, config: C) -> Self {
        ProjectServiceLocaleImpl { uploader, config }
    }

    pub fn post_project(&mut self, name: &str) -> Result<AtomicProject> {
        let project = Project::new(name, &self.config.get_root_dir());
        for dir in [CHAR_DIRNAME, DIALOG_DIRNAME, STATS_DIRNAME, ASSETS_DIRNAME] {
            fs::create_dir_all(project.get_path().join(dir))?;
        }
        Repository::init(project.get_path())?;
        let res = self.config.append_project(project)?;
        self.save_config();
        Ok(res)
    }

    pub fn get_projects(&self) -> AtomicProjects {
        self.config.get_projects()
    }

    fn save_config(&self) {
        let config_clone = self.config.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(e) = config_clone.save_async().await {
                eprintln!("Failed to save config: {e}");
            }
        });
    }
}
