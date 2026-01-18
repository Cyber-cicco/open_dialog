use std::{
    fs::{self, File},
    io::BufWriter,
    path::{Path, PathBuf},
    sync::{Arc, RwLock},
};

use crate::shared::types::project::{AtomicProject, AtomicProjects, Project};
use anyhow::{Context, Result};
use directories::ProjectDirs;
use serde::{Deserialize, Serialize};

pub const CONFIG_FILE_PATH: &str = "open_dialog_config.json";
pub const CHAR_DIRNAME: &str = "character";
pub const DIALOG_DIRNAME: &str = "dialog";
pub const STATS_DIRNAME: &str = "stats";
pub const ASSETS_DIRNAME: &str = "assets";

#[async_trait::async_trait]
pub trait ODConfig: Sized + Clone + Send + Sync + 'static {
    fn get_root_dir(&self) -> &PathBuf;
    fn init() -> Result<Self>;
    fn append_project(&mut self, project: Project) -> Result<AtomicProject>;
    fn get_projects(&self) -> AtomicProjects;
    async fn save_async(&self) -> Result<()>;
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ODConfigLocal {
    root_dir: PathBuf,
    projects: AtomicProjects,
    current_project_index: u64,
}

#[async_trait::async_trait]
impl ODConfig for ODConfigLocal {
    fn init() -> Result<Self> {
        let root_dir = ProjectDirs::from("fr", "cyber-cicco", "open_dialog")
            .map(|dir| dir.config_dir().to_path_buf())
            .context("could not open projects dir")?;
        let config_file_path = root_dir.join(CONFIG_FILE_PATH);

        if Path::exists(&config_file_path) {
            let file =
                fs::read_to_string(&config_file_path).context("Failed to read config file")?;
            let mut config:ODConfigLocal = serde_json::from_str(&file)
                .context("Failed to serialize the config file into AppConfig struct")?;
            config.root_dir = root_dir;
            return Ok(config);
        }

        fs::create_dir_all(&root_dir)
            .context("échec de la création du répertoire de la configuration")?;
        let config = ODConfigLocal {
            root_dir,
            projects: Arc::new(RwLock::new(vec![])),
            current_project_index: 0,
        };

        let file =
            File::create(config_file_path).context("failed to create new app config file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &config)
            .context("could not serialize config app config struct")?;

        Ok(config)
    }

    fn get_root_dir(&self) -> &PathBuf {
        return &self.root_dir;
    }

    fn append_project(&mut self, project: Project) -> Result<AtomicProject> {
        let arc = Arc::new(RwLock::new(project));
        self.projects
            .write()
            .expect("write lock could not be acquired")
            .push(arc.clone());
        Ok(arc)
    }

    fn get_projects(&self) -> AtomicProjects {
        self.projects.clone()
    }

    async fn save_async(&self) -> Result<()> {
        let file =
            File::create(self.root_dir.join(CONFIG_FILE_PATH)).expect("failed to open config file");
        serde_json::to_writer(BufWriter::new(file), &self).expect("failed to write config to file");
        Ok(())
    }
}
