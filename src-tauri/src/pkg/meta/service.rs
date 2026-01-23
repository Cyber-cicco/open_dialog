use std::{collections::HashSet, sync::Arc};

use anyhow::Result;
use uuid::Uuid;

use crate::{
    pkg::meta::dao::MetaDao,
    shared::{
        config::ODConfig,
        types::{interfaces::Shared, meta::VarToPhylum},
    },
};

pub struct MetaServiceLocalImpl<C: ODConfig, MD: MetaDao<C>> {
    config: Shared<C>,
    meta_dao: Arc<MD>,
}

impl<C: ODConfig, MD: MetaDao<C>> MetaServiceLocalImpl<C, MD> {
    pub fn new(config: Shared<C>, meta_dao: Arc<MD>) -> Self {
        Self { config, meta_dao }
    }

    pub fn get_var_to_phylum(&self, project_id: &str) -> Result<VarToPhylum> {
        self.meta_dao.get_var_to_phylum_map(project_id)
    }

    pub fn get_all_variable_hashet<'a>(&'a self, vars: &'a VarToPhylum) -> Result<HashSet<&'a Uuid>> {
        Ok(vars.data.iter().map(|(k, _v)| k).collect())
    }

    pub fn save_var_to_phylum_fk(&self,project_id: &str, vars:VarToPhylum) -> Result<()> {
        self.meta_dao.save_var_to_phylum(project_id, vars)
    }

}
