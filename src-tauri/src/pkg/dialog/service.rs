use std::sync::Arc;

use anyhow::{Ok, Result};

use crate::{pkg::dialog::dao::DialogDao, shared::{config::ODConfig, types::{dialog::{Dialog, DialogCreationForm, DialogMetadata}, interfaces::Shared}}};

pub struct DialogServiceLocalImpl<C:ODConfig, D:DialogDao<C>> {
    config:Shared<C>,
    dao:Arc<D>
}

impl<C:ODConfig, D:DialogDao<C>> DialogServiceLocalImpl<C, D> {

    pub fn new(config: Shared<C>, dao: Arc<D>) -> Self {
        DialogServiceLocalImpl { config, dao }
    }

    pub fn create_dialog(&self, project_id: &str, form: DialogCreationForm) -> Result<()> {
        unimplemented!()
    }

    pub fn get_dialog_by_id(&self, project_id: &str, dialog_id: &str) -> Result<Dialog> {
        unimplemented!()
    }

    pub fn get_dialog_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        unimplemented!()
    }

    pub fn save_dialog(&self, project_id: &str, dialog:Dialog) -> Result<()> {
        unimplemented!()
    }

    pub fn save_dialog_content(&self, dialog_id: &str, content: &str) -> Result<()> {
        unimplemented!()
    }
}


