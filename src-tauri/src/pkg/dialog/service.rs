use std::{str::FromStr, sync::Arc};

use anyhow::{Result};
use uuid::Uuid;

use crate::{
    pkg::{character::dao::CharacterDao, dialog::dao::DialogDao},
    shared::{
        config::ODConfig,
        types::{
            dialog::{Dialog, DialogCreationForm, DialogMetadata, SimpleDialog},
            interfaces::Shared,
        },
    },
};

pub struct DialogServiceLocalImpl<C: ODConfig, DD: DialogDao<C>, CD: CharacterDao<C>> {
    config: Shared<C>,
    dialog_dao: Arc<DD>,
    char_dao: Arc<CD>,
}

impl<C: ODConfig, DD: DialogDao<C>, CD: CharacterDao<C>> DialogServiceLocalImpl<C, DD, CD> {
    pub fn new(config: Shared<C>, dialog_dao: Arc<DD>, char_dao: Arc<CD>) -> Self {
        DialogServiceLocalImpl {
            config,
            dialog_dao,
            char_dao,
        }
    }

    pub fn create_dialog(&self, project_id: &str, form: DialogCreationForm) -> Result<()> {
        let uuid = &Uuid::from_str(form.main_char_id)?;
        self.char_dao
            .enforce_character_existence(project_id, &uuid)?;
        let mut metadata = self
            .dialog_dao
            .get_metadata(project_id)
            .or_else(|_| self.dialog_dao.create_metadata(project_id))?;
        let new_dialog = Dialog::from_dialog_creation_form(form)?;
        metadata
            .data
            .insert(new_dialog.get_id(), SimpleDialog::from_dialog(&new_dialog));
        self.dialog_dao.persist_dialog(project_id, new_dialog)?;

        //TODO: should retry and delete the dialog if it fails.
        self.dialog_dao.persist_metadata(project_id, &metadata)
    }

    pub fn get_dialog_by_id(&self, project_id: &str, dialog_id: &str) -> Result<Dialog> {
        self.dialog_dao.get_dialog_by_id(project_id, dialog_id)
    }

    pub fn get_dialog_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        match self.dialog_dao.get_dialog_metadata(project_id) {
            Ok(d) => Ok(d),
            Err(_) => self.dialog_dao.create_metadata(project_id)
        }
    }

    pub fn save_dialog(&self, project_id: &str, dialog: Dialog) -> Result<()> {
        dialog.enforce_links_coherence()?;
        let mut metadata = self.dialog_dao.get_metadata(project_id)?;
        let simple_dialog = SimpleDialog::from_dialog(&dialog);
        metadata.data.insert(dialog.get_id(), simple_dialog);

        self.dialog_dao.persist_dialog(project_id, dialog)?;
        self.dialog_dao.persist_metadata(project_id, &metadata)
    }


    pub fn save_dialog_content(&self, project_id: &str, dialog_id: &str, node_id:&str, content: &str) -> Result<()> {
        self.dialog_dao.persist_dialog_content(project_id, dialog_id, node_id, content)
    }
}
