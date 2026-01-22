use std::{
    collections::HashSet, fs::{self, File}, io::BufWriter, path::{PathBuf}, str::FromStr
};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::shared::{
    config::{ODConfig, DIALOG_DIRNAME},
    types::{
        dialog::{Dialog, DialogMetadata},
        interfaces::Shared,
    },
};

pub struct FileDialogDao<C: ODConfig> {
    config: Shared<C>,
}

pub trait DialogDao<C: ODConfig> {
    fn persist_dialog(&self, project_id: &str, dialog: Dialog) -> Result<()>;
    fn persist_metadata(&self, project_id: &str, metadata: &DialogMetadata) -> Result<()>;
    fn get_metadata(&self, project_id: &str) -> Result<DialogMetadata>;
    fn create_metadata(&self, project_id: &str) -> Result<DialogMetadata>;
    fn get_dialog_by_id(&self, project_id: &str, dialog_id: &str) -> Result<Dialog>;
    fn get_dialog_metadata(&self, project_id: &str) -> Result<DialogMetadata>;
    fn get_content(&self, project_id: &str, character_id: &str, node_id: &str) -> Result<String>;
    fn persist_dialog_content(
        &self,
        project_id: &str,
        dialog_id: &str,
        node_id: &str,
        content: &str,
    ) -> Result<()>;
    fn get_dialog_identifiers(&self, project_id: &str) -> Result<HashSet<Uuid>>;
}

impl<C: ODConfig> FileDialogDao<C> {
    pub fn new(config: Shared<C>) -> Self {
        FileDialogDao { config }
    }
}

impl<C: ODConfig> DialogDao<C> for FileDialogDao<C> {
    fn persist_dialog(&self, project_id: &str, dialog: Dialog) -> Result<()> {
        let dir_path = self.get_dialog_dir_id(project_id, &dialog.get_id().to_string())?;
        if !dir_path.is_dir() {
            fs::create_dir(&dir_path).context("could not create character directory")?;
        }
        let file_path = dir_path.join("meta.json");
        let file = File::create(file_path).context("could not create or open dialog file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &dialog).context("failed to deserialize dialog")
    }

    fn get_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        let file = fs::read(self.get_metadata_file(project_id)?)?;
        serde_json::from_slice(&file).context("could not deserialize metadata")
    }

    fn create_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        let metadata = DialogMetadata::new();
        self.persist_metadata(project_id, &metadata)?;
        Ok(metadata)
    }

    fn persist_metadata(&self, project_id: &str, metadata: &DialogMetadata) -> Result<()> {
        let file = File::create(self.get_metadata_file(project_id)?)
            .context("could not create or open metadata file")?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &metadata).context("failed to deserialize dialog")?;
        Ok(())
    }

    fn get_dialog_by_id(&self, project_id: &str, dialog_id: &str) -> Result<Dialog> {
        let path = self.get_dialog_meta_file(project_id, dialog_id)?;
        let file = fs::read(path).context("could not read dialog file")?;
        Ok(serde_json::from_slice(&file).context("could not deserialize dialog")?)
    }

    fn get_dialog_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        let path = self.get_metadata_file(project_id)?;
        let file = fs::read(path).context("could not read metadata file")?;
        Ok(serde_json::from_slice(&file).context("could not deserialize metadata")?)
    }

    fn persist_dialog_content(
        &self,
        project_id: &str,
        dialog_id: &str,
        node_id: &str,
        content: &str,
    ) -> Result<()> {
        let path = self.get_dialog_content_node_file(project_id, dialog_id, node_id)?;
        fs::write(path, content).context("could not write dialog content to file")?;
        Ok(())
    }

    fn get_content(&self, project_id: &str, dialog_id: &str, node_id: &str) -> Result<String> {
        let path = self.get_dialog_content_node_file(project_id, dialog_id, node_id)?;
        fs::read_to_string(path).context("could not read content file")
    }

    fn get_dialog_identifiers(&self, project_id: &str) -> Result<HashSet<Uuid>> {
        let path = self.get_dialog_dir(project_id)?;
        fs::read_dir(path)?
            .filter_map(|entry| entry.ok())
            .filter_map(|e| e.path().file_name()?.to_str().map(String::from))
            .filter(|file_name| file_name != "meta.json")
            .map(|name| Uuid::from_str(&name).context(format!("could not create uuid from string {name}")))
            .collect::<Result<HashSet<Uuid>>>()
    }
}

impl<C: ODConfig> FileDialogDao<C> {
    pub fn get_dialog_dir(&self, project_id: &str) -> Result<PathBuf> {
        let project_path = &Uuid::from_str(project_id)?.simple().to_string()[..12];
        Ok(self
            .config
            .lock()?
            .get_root_dir()
            .join(project_path)
            .join(DIALOG_DIRNAME))
    }

    pub fn get_metadata_file(&self, project_id: &str) -> Result<PathBuf> {
        Ok(self.get_dialog_dir(project_id)?.join("meta.json"))
    }

    pub fn get_dialog_dir_id(&self, project_id: &str, dialog_id: &str) -> Result<PathBuf> {
        Ok(self.get_dialog_dir(project_id)?.join(dialog_id))
    }

    pub fn get_dialog_meta_file(&self, project_id: &str, dialog_id: &str) -> Result<PathBuf> {
        Ok(self
            .get_dialog_dir_id(project_id, dialog_id)?
            .join("meta.json"))
    }

    pub fn get_dialog_content_node_file(
        &self,
        project_id: &str,
        dialog_id: &str,
        node_id: &str,
    ) -> Result<PathBuf> {
        Ok(self
            .get_dialog_dir_id(project_id, dialog_id)?
            .join(format!("{node_id}.txt")))
    }
}
