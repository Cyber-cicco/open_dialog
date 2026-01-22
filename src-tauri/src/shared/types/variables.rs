use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct GlobalVariable {
    id: Uuid,
    name: String,
    current_state: String,
    potential_states: Vec<String>
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct GlobalCharacterVariable {
    id: Uuid,
    name: String,
    potential_states: Vec<String>,
    characters: Vec<CharacterVariableState>
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct CharacterVariableState {
    current_state: String,
    character_id: Uuid
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct CharacterVariable {
    id:Uuid,
    name:String,
    current_state: String,
    potential_states: Vec<String>,
    character_id:Uuid,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct DialogVariable {
    id:Uuid,
    name:String,
    current_state: String,
    potential_states: Vec<String>,
    dialog_id:Uuid,
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub enum Variable {
    Global(GlobalVariable),
    GlobalChar(GlobalCharacterVariable),
    Char(CharacterVariable),
    Dialog(DialogVariable)
}

#[derive(TS)]
#[ts(export, export_to = "../../src/bindings/")]
#[derive(Debug, Serialize, Deserialize)]
pub struct VariableStore {
    data: Vec<Variable>
}
