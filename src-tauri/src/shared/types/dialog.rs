use std::{
    collections::{HashMap, HashSet},
    str::FromStr,
};

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
    id: Uuid,
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
    id: Uuid,
    content: String,
    next_node: Option<Uuid>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct DialogNode {
    next_node: Option<Uuid>,
    character_id: Option<Uuid>,
    pub content_link: Option<Uuid>,
    pub content: Option<String>,
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
    id: Uuid,
    priority: i32,
    name: String,
    necessities: Option<NecessityExpression>,
    next_node: Option<Uuid>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct TreeNecessity {
    left: Box<NecessityExpression>,
    operator: Operator,
    right: Box<NecessityExpression>,
}

type Operator = String;

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
#[enum_dispatch::enum_dispatch(VariableCoherent, VariableContainer)]
pub enum NecessityExpression {
    Tree(TreeNecessity),
    Var(VarNecessity),
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

pub struct PhylumDiff<'a> {
    pub added: Vec<&'a Phylum>,
    pub deleted: Vec<&'a Phylum>,
}

pub struct DialogContent<'a> {
    pub content: String,
    pub node_id: &'a Uuid,
}

#[enum_dispatch::enum_dispatch]
trait Coherent {
    fn enforce_coherence(&self, dialog: &Dialog) -> Result<()>;
}

#[enum_dispatch::enum_dispatch]
trait VariableCoherent {
    fn enforce_variable_coherence(&self, vars: &HashSet<&Uuid>) -> Result<()>;
}

#[enum_dispatch::enum_dispatch]
trait VariableContainer {
    fn add_var_to_list(&self, list: &mut Vec<Uuid>);
}

impl DialogMetadata {
    pub fn new() -> Self {
        DialogMetadata {
            data: HashMap::new(),
        }
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

impl Node {
    pub fn get_data(&mut self) -> &mut NodeData {
        &mut self.data
    }

    pub fn get_id(&self) -> &Uuid {
        return &self.id;
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

    pub fn get_nodes(&mut self) -> &mut HashMap<Uuid, Node> {
        &mut self.nodes
    }

    pub fn get_phylums_map(&self) -> HashMap<Uuid, &Phylum> {
        let mut res = HashMap::new();
        for (_, v) in &self.nodes {
            if let NodeData::Phylum(p) = &v.data {
                res.insert(p.id, p);
            }
        }
        res
    }

    pub fn get_diffs<'a>(&'a self, prev: &'a Dialog) -> PhylumDiff<'a> {
        let currents = self.get_phylums_map();
        let previous = prev.get_phylums_map();
        let mut deleted: Vec<&Phylum> = vec![];
        let mut added: Vec<&Phylum> = vec![];

        for (k, v) in &currents {
            if !&previous.contains_key(&k) {
                added.push(v);
            }
        }

        for (k, v) in previous {
            if !currents.contains_key(&k) {
                deleted.push(v);
            }
        }

        PhylumDiff { added, deleted }
    }

    pub fn enforce_links_coherence(&self, vars: HashSet<&Uuid>) -> Result<()> {
        for (_, v) in &self.nodes {
            v.data.enforce_coherence(&self)?;
            if let NodeData::Phylum(p) = &v.data {
                p.enforce_variable_coherence(&vars)?;
            }
        }
        Ok(())
    }

    pub fn collect_content<'a>(&'a mut self, collector: &mut Vec<DialogContent<'a>>) {
        for (_uuid, node) in &mut self.nodes {
            if let NodeData::Dialog(dialog) = &mut node.data {
                let content = match &dialog.content {
                    Some(str) => str.clone(),
                    None => continue,
                };
                dialog.content = None;
                dialog.content_link = Some(node.id);
                collector.push(DialogContent {
                    content,
                    node_id: &node.id,
                });
            }
        }
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

impl Phylum {
    fn enforce_variable_coherence(&self, vars: &HashSet<&Uuid>) -> Result<()> {
        for branch in &self.branches {
            branch.enforce_variable_coherence(vars)?;
        }
        Ok(())
    }

    pub fn get_id(&self) -> &Uuid {
        &self.id
    }

    pub fn get_variables(&self) -> Vec<Uuid> {
        let mut res = vec![];
        for branch in &self.branches {
            branch.add_var_to_list(&mut res);
        }
        res
    }
}

impl VariableCoherent for Conditions {
    fn enforce_variable_coherence(&self, vars: &HashSet<&Uuid>) -> Result<()> {
        match &self.necessities {
            Some(n) => n.enforce_variable_coherence(vars),
            None => Ok(()),
        }
    }
}

impl VariableContainer for Conditions {
    fn add_var_to_list(&self, list: &mut Vec<Uuid>) {
        match &self.necessities {
            Some(n) => n.add_var_to_list(list),
            None => (),
        }
    }
}

impl VariableCoherent for TreeNecessity {
    fn enforce_variable_coherence(&self, vars: &HashSet<&Uuid>) -> Result<()> {
        self.left.enforce_variable_coherence(vars)?;
        self.right.enforce_variable_coherence(vars)
    }
}
impl VariableContainer for TreeNecessity {
    fn add_var_to_list(&self, list: &mut Vec<Uuid>) {
        self.right.add_var_to_list(list);
        self.left.add_var_to_list(list);
    }
}

impl VariableCoherent for VarNecessity {
    fn enforce_variable_coherence(&self, vars: &HashSet<&Uuid>) -> Result<()> {
        let id = &self.var_id;
        if !vars.contains(id) {
            bail!("necessity was linked to undefined variable {id}")
        }
        Ok(())
    }
}

impl VariableContainer for VarNecessity {
    fn add_var_to_list(&self, list: &mut Vec<Uuid>) {
        list.push(self.var_id);
    }
}
