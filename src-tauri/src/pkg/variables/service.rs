use std::{str::FromStr, sync::Arc};

use anyhow::{Context, Result};
use uuid::Uuid;

use crate::{
    pkg::{
        character::dao::CharacterDao, dialog::dao::DialogDao, project, variables::dao::VariableDao,
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
> {
    config: Shared<C>,
    var_dao: Arc<VD>,
    char_dao: Arc<CD>,
    dialog_dao: Arc<DD>,
}

impl<C: ODConfig, VD: VariableDao<C>, CD: CharacterDao<C>, DD: DialogDao<C>>
    VariableServiceLocalImpl<C, VD, CD, DD>
{
    pub fn new(
        config: Shared<C>,
        var_dao: Arc<VD>,
        char_dao: Arc<CD>,
        dialog_dao: Arc<DD>,
    ) -> Self {
        VariableServiceLocalImpl {
            char_dao,
            dialog_dao,
            config,
            var_dao,
        }
    }

    pub fn persist_variables(&self, project_id: &str, vars: VariableStore) -> Result<()> {
        let char_uuids = self.char_dao.get_character_identifiers(project_id)?;
        let dialog_uuids = self.dialog_dao.get_dialog_identifiers(project_id)?;
        unimplemented!()
    }
}
