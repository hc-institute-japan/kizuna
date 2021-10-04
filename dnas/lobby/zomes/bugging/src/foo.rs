use hdk::prelude::*;
#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct Foo {
    pub content: String,
    pub time_sent: Timestamp,
}

#[derive(Serialize, Deserialize, SerializedBytes, Clone, Debug)]
pub struct FoosWrapper(pub Vec<Foo>);

entry_def!(Foo
  EntryDef {
      id: "foo".into(),
      visibility: EntryVisibility::Private,
      crdt_type: CrdtType,
      required_validations: RequiredValidations::default(),
      required_validation_type: RequiredValidationType::Element
  }
);
