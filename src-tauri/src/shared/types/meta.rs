use std::collections::HashMap;

use anyhow::{anyhow, bail, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::shared::types::{dialog::PhylumDiff, interfaces::Identified, variables::VariableStore};

type VarIdentifier = Uuid;
type DialogNodeIdentifier = Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct VarToPhylum {
    pub data: HashMap<VarIdentifier, Vec<DialogNodeIdentifier>>,
}

impl VarToPhylum {
    pub fn enforce_free_existing_var(&self, id: &VarIdentifier) -> Result<()> {
        let var = self.data.get(id).ok_or(anyhow!("{id} was not present"))?;
        if var.len() != 0 {
            bail!("var {id} is still linked to dialog nodes")
        }
        Ok(())
    }

    pub fn new() -> Self {
        Self {
            data: HashMap::new(),
        }
    }

    pub fn mutate_to_match_diffs(&mut self, diffs: PhylumDiff) -> Result<()> {
        for deleted in diffs.deleted {
            let phylum_id = *deleted.get_id();
            for var in deleted.get_variables() {
                if let Some(phylum_ids) = self.data.get_mut(&var) {
                    phylum_ids.retain(|id| *id != phylum_id);
                }
            }
        }

        for added in diffs.added {
            let phylum_id = *added.get_id();
            for var in added.get_variables() {
                self.data
                    .entry(var)
                    .or_insert_with(Vec::new)
                    .push(phylum_id);
            }
        }

        Ok(())
    }

    pub fn fill_non_existing_keys(&mut self, vars: VariableStore) {
        for var in vars.data {
            let id = var.get_id().clone();
            if !self.data.contains_key(&id) {
                self.data.insert(id, vec![]);
            }
        }
    }

}
