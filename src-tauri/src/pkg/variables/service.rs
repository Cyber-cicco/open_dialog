use std::sync::Arc;

use crate::{pkg::variables::dao::VariableDao, shared::{config::ODConfig, types::interfaces::Shared}};


pub struct VariableServiceLocalImpl<C: ODConfig, D: VariableDao<C>> {
    config: Shared<C>,
    dao: Arc<D>,
}

impl<C: ODConfig, D: VariableDao<C>> VariableServiceLocalImpl<C, D> {
    pub fn new(config: Shared<C>, dao: Arc<D>) -> Self {
        VariableServiceLocalImpl {
            config,
            dao,
        }
    }

    pub fn create_variable(&self, project_id:&str) -> Result<()> {
        unimplemented!()
    }
}
