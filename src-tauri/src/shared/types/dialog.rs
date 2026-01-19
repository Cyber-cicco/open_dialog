use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

pub struct SimpleDialog {
    id: Uuid,
    name: String,
    main_character: Uuid,
}

pub struct DialogMetadata {
    data:Vec<SimpleDialog>
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Dialog {
    id: Uuid,
    name: String,
    root_node: Option<Uuid>,
    characters_ids: Vec<Uuid>,
    created_at: DateTime<Utc>,
    main_character: Uuid,
    nodes: HashMap<Uuid, Node>
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Node {
    pos_x: i32,
    pos_y: i32,
    data: NodeData,
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub enum NodeData {
    Dialog(DialogNode),
    Conditions(Phylum),
    Choices(Choices),
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Choices {
    choices: Vec<Choice>,
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Choice {
    content:String,
    next_node: Option<Uuid>,
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct DialogNode {
    next_node: Option<Uuid>,
    character_id: Option<Uuid>,
    content_link: Option<Uuid>,
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Phylum {
    id:Uuid,
    name:Option<String>,
    branches: Vec<Conditions>
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Conditions {
    priority:i32,
    necessities: Vec<VarNecessity>,
    next_node: Option<Uuid>,
}

#[derive(TS)]
#[derive(Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct VarNecessity {
    var_id: Uuid,
    necessary_state: String,
}

pub struct DialogCreationForm<'a> {
    name:&'a str,
    main_char_id: &'a str,
}

