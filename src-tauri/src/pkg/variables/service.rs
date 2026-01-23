use std::{str::FromStr, sync::Arc};

use anyhow::Result;
use uuid::Uuid;

use crate::{
    pkg::{
        character::dao::CharacterDao, dialog::dao::DialogDao, meta::dao::MetaDao,
        variables::dao::VariableDao,
    },
    shared::{
        config::ODConfig,
        types::{interfaces::Shared, variables::VariableStore},
    },
};

pub struct VariableServiceLocalImpl<
    C: ODConfig,
    VD: VariableDao<C>,
    CD: CharacterDao<C>,
    DD: DialogDao<C>,
    MD: MetaDao<C>,
> {
    config: Shared<C>,
    var_dao: Arc<VD>,
    char_dao: Arc<CD>,
    dialog_dao: Arc<DD>,
    meta_dao: Arc<MD>,
}

impl<C: ODConfig, VD: VariableDao<C>, CD: CharacterDao<C>, DD: DialogDao<C>, MD: MetaDao<C>>
    VariableServiceLocalImpl<C, VD, CD, DD, MD>
{
    pub fn new(
        config: Shared<C>,
        var_dao: Arc<VD>,
        char_dao: Arc<CD>,
        dialog_dao: Arc<DD>,
        meta_dao: Arc<MD>,
    ) -> Self {
        VariableServiceLocalImpl {
            char_dao,
            dialog_dao,
            config,
            var_dao,
            meta_dao,
        }
    }

    pub fn persist_variables(&self, project_id: &str, vars: VariableStore) -> Result<()> {
        let char_ids = self.char_dao.get_character_identifiers(project_id)?;
        let dialog_ids = self.dialog_dao.get_dialog_identifiers(project_id)?;
        vars.enforce_coherence(dialog_ids, char_ids)?;
        self.var_dao.persist_variables(project_id, &vars)
    }

    pub fn delete_variable(&self, project_id: &str, var_id: &str) -> Result<()> {
        let id = Uuid::from_str(var_id)?;
        let var_to_phylum = self.meta_dao.get_var_to_phylum_map(project_id)?;
        var_to_phylum.enforce_free_existing_var(&id)?;
        let mut vars = self.var_dao.load_variables(project_id)?;
        vars.delete_var_with_id(&id);
        self.var_dao.persist_variables(project_id, &vars)
    }

    pub fn load_variables(&self, project_id: &str) -> Result<VariableStore> {
        self.var_dao.load_variables(project_id)
    }
}
