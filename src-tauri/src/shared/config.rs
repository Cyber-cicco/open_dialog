use std::{
    fs::{self, File},
    io::BufWriter,
    path::{Path, PathBuf},
    str::FromStr,
    sync::{Arc, RwLock},
};

use crate::shared::types::project::{AtomicProject, AtomicProjects, Project};
use anyhow::{bail, Context, Result};
use directories::ProjectDirs;
use email_address::EmailAddress;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub const CONFIG_FILE_PATH: &str = "open_dialog_config.json";
pub const CHAR_DIRNAME: &str = "character";
pub const DIALOG_DIRNAME: &str = "dialog";
pub const STATS_DIRNAME: &str = "stats";
pub const META_DIRNAME: &str = "meta";
pub const ASSETS_DIRNAME: &str = "assets";

pub const VARS: &str = "vars.json";
pub const META_FK_VARS_DIALOGS: &str = "meta/vars_dialogs.json";
pub const DIALOG_META: &str = "dialog/meta.json";
pub const CHARACTER_META: &str = "character/meta.json";

#[async_trait::async_trait]
pub trait ODConfig: Sized + Clone + Send + Sync + 'static {
    fn get_root_dir(&self) -> &PathBuf;
    fn init() -> Result<Self>;
    fn append_project(&mut self, project: Project) -> Result<AtomicProject>;
    fn get_projects(&self) -> AtomicProjects;
    fn get_project_dir(&self, project_id: &str) -> Result<PathBuf>;
    fn set_user(&mut self, name: &str);
    fn set_email(&mut self, email: &str) -> Result<()>;
    async fn save_async(&self) -> Result<()>;
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ODConfigLocal {
    root_dir: PathBuf,
    user: String,
    email: Option<String>,
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
            let mut config: ODConfigLocal = serde_json::from_str(&file)
                .context("Failed to serialize the config file into AppConfig struct")?;
            config.root_dir = root_dir;
            return Ok(config);
        }

        fs::create_dir_all(&root_dir)
            .context("échec de la création du répertoire de la configuration")?;
        let name = whoami::username()?;
        let config = ODConfigLocal {
            root_dir,
            user: name,
            email: None,
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

    fn set_user(&mut self, name: &str) {
        self.user = String::from(name);
    }

    fn set_email(&mut self, email: &str) -> Result<()> {
        if !EmailAddress::is_valid(email) {
            bail!("invalid email adress")
        }
        self.email = Some(String::from(email));
        Ok(())
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

    fn get_project_dir(&self, project_id: &str) -> Result<PathBuf> {
        let res = &Uuid::from_str(project_id)?.simple().to_string()[..12];
        Ok(self.get_root_dir().join(res))
    }

    async fn save_async(&self) -> Result<()> {
        let file =
            File::create(self.root_dir.join(CONFIG_FILE_PATH)).expect("failed to open config file");
        serde_json::to_writer(BufWriter::new(file), &self).expect("failed to write config to file");
        Ok(())
    }
}
