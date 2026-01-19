use uuid::Uuid;

struct Variable {
    id: Uuid,
    name: String,
    current_state: String,
    potential_states: Vec<String>
}
