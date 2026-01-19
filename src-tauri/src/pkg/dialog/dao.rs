use anyhow::Result;

use crate::shared::{
    config::ODConfig,
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
    fn persist_metadata(&self, project_id: &str, metadata: DialogMetadata) -> Result<()>;
    fn get_metadata(&self, project_id: &str) -> Result<DialogMetadata>;
    fn create_metadata(&self, project_id: &str) -> Result<DialogMetadata>;
    fn get_dialog_by_id(&self, project_id: &str, dialog_id: &str) -> Result<Dialog>;
    fn get_dialog_metadata(&self, project_id: &str) -> Result<DialogMetadata>;
}

impl<C: ODConfig> FileDialogDao<C> {
    pub fn new(config: Shared<C>) -> Self {
        FileDialogDao { config }
    }
}

impl<C: ODConfig> DialogDao<C> for FileDialogDao<C> {
    fn persist_dialog(&self, project_id: &str, dialog: Dialog) -> Result<()> {
        unimplemented!()
    }

    fn get_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        unimplemented!()
    }

    fn create_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        unimplemented!()
    }

    fn persist_metadata(&self, project_id: &str, metadata: DialogMetadata) -> Result<()> {
        unimplemented!()
    }

    fn get_dialog_by_id(&self, project_id: &str, dialog_id: &str) -> Result<Dialog> {
        unimplemented!()
    }


    fn get_dialog_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        unimplemented!()
    }
}
