use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct CommitInfo {
    pub id: String,
    pub message: Option<String>,
    pub author: Option<String>,
    pub email: Option<String>,
    pub timestamp: i64,
    pub parents: Vec<String>,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct BranchInfo {
    pub name: String,
    pub tip: String,
}

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export, export_to = "../../src/bindings/")]
pub struct CommitGraph {
    commits: Vec<CommitInfo>,
    head: Option<String>,
    branches: Vec<BranchInfo>,
}

impl CommitGraph {
    pub fn new(commits: Vec<CommitInfo>, head: Option<String>, branches: Vec<BranchInfo>) -> Self {
        Self { commits, head, branches }
    }
}

impl BranchInfo {
    pub fn new(name:String, tip:String) -> Self {
        Self { name, tip }
    }
}
