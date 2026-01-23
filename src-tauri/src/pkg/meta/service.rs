use std::{collections::HashSet, sync::Arc};

use anyhow::Result;
use uuid::Uuid;

use crate::{
    pkg::meta::dao::MetaDao,
    shared::{config::ODConfig, types::interfaces::Shared},
};

pub struct MetaServiceLocalImpl<C: ODConfig, MD: MetaDao<C>> {
    config: Shared<C>,
    meta_dao: Arc<MD>,
}

impl<C: ODConfig, MD: MetaDao<C>> MetaServiceLocalImpl<C, MD> {
    pub fn new(config: Shared<C>, meta_dao: Arc<MD>) -> Self {
        Self { config, meta_dao }
    }

    pub fn get_all_variable_hashet(&self, project_id: &str) -> Result<HashSet<Uuid>> {
        let var_to_phylum = self.meta_dao.get_var_to_phylum_map(project_id)?;
        Ok(var_to_phylum.data
            .iter()
            .map(|(k, _v)| k.clone())
            .collect())
    }
}
