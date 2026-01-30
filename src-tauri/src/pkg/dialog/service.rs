use std::{str::FromStr, sync::Arc};

use anyhow::{anyhow, Result};
use uuid::Uuid;

use crate::{
    pkg::{
        character::dao::CharacterDao,
        dialog::dao::DialogDao,
        meta::{dao::MetaDao, service::MetaServiceLocalImpl},
    },
    shared::{
        config::ODConfig,
        types::{
            dialog::{
                Dialog, DialogContent, DialogCreationForm, DialogMetadata, NodeData, SimpleDialog,
            },
            interfaces::Shared,
        },
    },
};

pub struct DialogServiceLocalImpl<
    C: ODConfig,
    DD: DialogDao<C>,
    CD: CharacterDao<C>,
    MD: MetaDao<C>,
> {
    config: Shared<C>,
    dialog_dao: Arc<DD>,
    char_dao: Arc<CD>,
    meta_srv: MetaServiceLocalImpl<C, MD>,
}

impl<C: ODConfig, DD: DialogDao<C>, CD: CharacterDao<C>, MD: MetaDao<C>>
    DialogServiceLocalImpl<C, DD, CD, MD>
{
    pub fn new(
        config: Shared<C>,
        dialog_dao: Arc<DD>,
        char_dao: Arc<CD>,
        meta_srv: MetaServiceLocalImpl<C, MD>,
    ) -> Self {
        DialogServiceLocalImpl {
            config,
            dialog_dao,
            char_dao,
            meta_srv,
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
        let order = form.order;
        let new_dialog = Dialog::from_dialog_creation_form(form)?;
        metadata.data.insert(
            new_dialog.get_id(),
            SimpleDialog::from_dialog(&new_dialog, order),
        );
        self.dialog_dao.persist_dialog(project_id, new_dialog)?;

        //TODO: should retry and delete the dialog if it fails.
        self.dialog_dao.persist_metadata(project_id, &metadata)
    }

    pub fn get_dialog_by_id(&self, project_id: &str, dialog_id: Uuid) -> Result<Dialog> {
        let mut dialog = self.dialog_dao.get_dialog_by_id(project_id, &dialog_id)?;
        for (uuid, node) in dialog.get_nodes() {
            if let NodeData::Dialog(dialog) = node.get_data() {
                if dialog.content_link.is_some() {
                    let content = self
                        .dialog_dao
                        .get_content(project_id, &dialog_id, uuid)?;
                    dialog.content = Some(content);
                }
            };
        }
        Ok(dialog)
    }

    pub fn get_dialog_metadata(&self, project_id: &str) -> Result<DialogMetadata> {
        match self.dialog_dao.get_dialog_metadata(project_id) {
            Ok(d) => Ok(d),
            Err(_) => self.dialog_dao.create_metadata(project_id),
        }
    }

    pub fn save_dialog(&self, project_id: &str, mut dialog: Dialog) -> Result<()> {
        let mut fks = self.meta_srv.get_var_to_phylum(project_id)?;
        let vars = self.meta_srv.get_all_variable_hashet(&fks)?;
        dialog.enforce_links_coherence(vars)?;
        let prev_dialog = self
            .dialog_dao
            .get_dialog_by_id(project_id, &dialog.get_id())?;
        let diffs = dialog.get_diffs(&prev_dialog);
        fks.mutate_to_match_diffs(diffs)?;

        let mut metadata = self.dialog_dao.get_metadata(project_id)?;
        let prev = metadata
            .data
            .get(&dialog.get_id())
            .ok_or(anyhow!("dialog did not exist"))?;
        let simple_dialog = SimpleDialog::from_dialog(&dialog, prev.get_order());
        metadata.data.insert(dialog.get_id(), simple_dialog);
        let mut collector: Vec<DialogContent> = vec![];
        let dialog_id = &dialog.get_id();

        dialog.collect_content(&mut collector);
        for content in collector {
            self.dialog_dao.persist_dialog_content(
                project_id,
                dialog_id,
                &content.node_id,
                &content.content,
            )?;
        }

        self.dialog_dao.persist_dialog(project_id, dialog)?;
        self.meta_srv.save_var_to_phylum_fk(project_id, fks)?;
        self.dialog_dao.persist_metadata(project_id, &metadata)
    }

    /// Used only to change metadata, and not add / supress a dialog.
    /// Throws if the old metadata and the new do not contain the same dialogs
    pub fn save_dialog_metadata(
        &self,
        project_id: &str,
        dialog_metadata: DialogMetadata,
    ) -> Result<()> {
        let old = self.dialog_dao.get_metadata(project_id)?;
        dialog_metadata.enforce_metadata_contains_same_dialogs(old)?;
        self.dialog_dao
            .persist_metadata(project_id, &dialog_metadata)?;
        Ok(())
    }

    pub fn delete_dialog(&self, project_id: &str, dialog_id: Uuid) -> Result<()> {
        let mut metadata = self.dialog_dao.get_metadata(project_id)?;
        metadata.delete_dialog_by_id(&dialog_id)?;
        self.dialog_dao.delete_dialog_by_id(project_id, &dialog_id)?;
        self.dialog_dao.persist_metadata(project_id, &metadata)
    }

    pub fn save_dialog_content(
        &self,
        project_id: &str,
        dialog_id: Uuid,
        node_id: Uuid,
        content: &str,
    ) -> Result<()> {
        self.dialog_dao
            .persist_dialog_content(project_id, &dialog_id, &node_id, content)
    }
}
