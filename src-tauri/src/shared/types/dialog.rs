use std::{collections::HashMap, str::FromStr};

use anyhow::{bail, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct SimpleDialog {
    id: Uuid,
    name: String,
    main_character: Uuid,
    characters: Vec<Uuid>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct DialogMetadata {
    pub data: HashMap<Uuid, SimpleDialog>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Dialog {
    id: Uuid,
    name: String,
    root_node: Option<Uuid>,
    characters_ids: Vec<Uuid>,
    created_at: DateTime<Utc>,
    main_character: Uuid,
    nodes: HashMap<Uuid, Node>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Node {
    pos_x: i32,
    pos_y: i32,
    data: NodeData,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
#[enum_dispatch::enum_dispatch(Coherent)]
pub enum NodeData {
    Dialog(DialogNode),
    Phylum(Phylum),
    Choices(Choices),
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Choices {
    choices: Vec<Choice>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Choice {
    content: String,
    next_node: Option<Uuid>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct DialogNode {
    next_node: Option<Uuid>,
    character_id: Option<Uuid>,
    content_link: Option<Uuid>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Phylum {
    id: Uuid,
    name: Option<String>,
    branches: Vec<Conditions>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct Conditions {
    priority: i32,
    necessities: Vec<VarNecessity>,
    next_node: Option<Uuid>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct VarNecessity {
    var_id: Uuid,
    necessary_state: String,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct DialogCreationForm<'a> {
    pub name: &'a str,
    pub main_char_id: &'a str,
}

#[enum_dispatch::enum_dispatch]
trait Coherent {
    fn enforce_coherence(&self, dialog: &Dialog) -> Result<()>;
}

impl DialogMetadata {
    pub fn new() -> Self {
        DialogMetadata {
            data: HashMap::new(),
        }
    }
}
impl Dialog {
    pub fn from_dialog_creation_form(form: DialogCreationForm) -> Result<Self> {
        let id = Uuid::new_v4();
        let char_id = Uuid::from_str(form.main_char_id)?;
        Ok(Dialog {
            id: id,
            name: String::from(form.name),
            root_node: None,
            characters_ids: vec![],
            created_at: Utc::now(),
            main_character: char_id,
            nodes: HashMap::new(),
        })
    }

    pub fn get_id(&self) -> Uuid {
        return self.id;
    }

    pub fn enforce_links_coherence(&self) -> Result<()> {
        for (_, v) in &self.nodes {
            v.data.enforce_coherence(&self)?;
        }
        Ok(())
    }
}

impl Coherent for DialogNode {
    fn enforce_coherence(&self, dialog: &Dialog) -> Result<()> {
        if let Some(n) = self.next_node {
            if !dialog.nodes.contains_key(&n) {
                bail!("incoherent key found : {n}")
            }
        }
        Ok(())
    }
}

impl Coherent for Choices {
    fn enforce_coherence(&self, dialog: &Dialog) -> Result<()> {
        for choice in &self.choices {
            if let Some(n) = choice.next_node {
                if !dialog.nodes.contains_key(&n) {
                    bail!("incoherent key found : {n}")
                }
            }
        }
        Ok(())
    }
}

impl Coherent for Phylum {
    fn enforce_coherence(&self, dialog: &Dialog) -> Result<()> {
        for condition in &self.branches {
            if let Some(n) = condition.next_node {
                if !dialog.nodes.contains_key(&n) {
                    bail!("incoherent key found {n}")
                }
            }
        }
        Ok(())
    }
}

impl SimpleDialog {
    pub fn from_dialog(dialog: &Dialog) -> Self {
        SimpleDialog {
            id: dialog.id,
            name: dialog.name.clone(),
            main_character: dialog.main_character,
            characters: dialog.characters_ids.clone(),
        }
    }
}
