#![no_std]

// Export main contracts
pub mod auto_builder;
pub mod project_factory;
pub mod ai_oracle;

// Export modules for reuse
pub mod modules {
    pub mod access_control;
    pub mod payment_handler;
    pub mod storage;
}

// Re-export commonly used types
pub use multiversx_sc::{
    api::ManagedTypeApi,
    types::{
        Address, BigUint, ManagedAddress, ManagedBuffer, ManagedVec,
        TokenIdentifier, EgldOrEsdtTokenIdentifier
    },
    contract, derive, imports, require,
};

// Common result type
pub type ContractResult<T> = Result<T, &'static str>;