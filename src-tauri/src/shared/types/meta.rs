use std::collections::HashMap;

use anyhow::{anyhow, bail, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

type VarIdentifier = Uuid;
type DialogNodeIdentifier = Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct VarToPhylum {
    pub data: HashMap<VarIdentifier, Vec<DialogNodeIdentifier>>,
}

impl VarToPhylum {
    pub fn enforce_free_existing_var(&self, id: &VarIdentifier) -> Result<()> {
        let var = self
            .data
            .get(id)
            .ok_or(anyhow!("{id} was not present"))?;
        if var.len() != 0 {
            bail!("var {id} is still linked to dialog nodes")
        }
        Ok(())
    }

    pub fn new() -> Self {
        Self { data: HashMap::new() }
    }
}
