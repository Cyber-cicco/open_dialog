use std::collections::HashSet;

use anyhow::{Result, bail};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

use crate::pkg::dialog;

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct GlobalVariable {
    id: Uuid,
    name: String,
    current_state: String,
    potential_states: Vec<String>,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct GlobalCharacterVariable {
    id: Uuid,
    name: String,
    potential_states: Vec<String>,
    characters: Vec<CharacterVariableState>,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct CharacterVariableState {
    current_state: String,
    character_id: Uuid,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct CharacterVariable {
    id: Uuid,
    name: String,
    current_state: String,
    potential_states: Vec<String>,
    character_id: Uuid,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct DialogVariable {
    id: Uuid,
    name: String,
    current_state: String,
    potential_states: Vec<String>,
    dialog_id: Uuid,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
#[enum_dispatch::enum_dispatch(CoherentVar)]
pub enum Variable {
    Global(GlobalVariable),
    GlobalChar(GlobalCharacterVariable),
    Char(CharacterVariable),
    Dialog(DialogVariable),
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct VariableStore {
    data: Vec<Variable>,
}

#[enum_dispatch::enum_dispatch]
trait CoherentVar {
    fn enforce_coherence(
        &self,
        dialog_ids: &HashSet<Uuid>,
        character_ids: &HashSet<Uuid>,
    ) -> Result<()>;
}

impl VariableStore {
    pub fn enforce_coherence(
        &self,
        dialog_ids: HashSet<Uuid>,
        character_ids: HashSet<Uuid>,
    ) -> Result<()> {
        for var in &self.data {
            var.enforce_coherence(&dialog_ids, &character_ids)?;
        }
        Ok(())
    }
}

impl CoherentVar for GlobalCharacterVariable {
    fn enforce_coherence(
        &self,
        _dialog_ids: &HashSet<Uuid>,
        character_ids: &HashSet<Uuid>,
    ) -> Result<()> {
        for char in &self.characters {
            if !character_ids.contains(&char.character_id) {
                bail!("incoherent character id in global character variable")
            }
        }
        Ok(())
    }
}

impl CoherentVar for GlobalVariable {
    fn enforce_coherence(
        &self,
        _dialog_ids: &HashSet<Uuid>,
        _character_ids: &HashSet<Uuid>,
    ) -> Result<()> {
        Ok(())
    }
}

impl CoherentVar for CharacterVariable {
    fn enforce_coherence(
        &self,
        _dialog_ids: &HashSet<Uuid>,
        character_ids: &HashSet<Uuid>,
    ) -> Result<()> {
        if !character_ids.contains(&self.character_id) {
            bail!("incoherent character id in character variable")
        }
        Ok(())
    }
}

impl CoherentVar for DialogVariable {
    fn enforce_coherence(
        &self,
        dialog_ids: &HashSet<Uuid>,
        _character_ids: &HashSet<Uuid>,
    ) -> Result<()> {
        if !dialog_ids.contains(&self.dialog_id) {
            bail!("incoherent character id in character variable")
        }
        Ok(())
    }
}
