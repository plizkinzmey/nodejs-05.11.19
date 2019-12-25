class Store {
    ACTIVE_USER = 'activeUser';
    state = {
        activeUser: null,
    };

    get( key = this.ACTIVE_USER ) {
        const state = this.state;
        if ( state.hasOwnProperty( key ) ) {
            return state[ key ];
        }
        return null;
    }

    setState( newState ) {
        return this.state = { ...this.state, ...newState };
    }
}

module.exports = { store: new Store() };