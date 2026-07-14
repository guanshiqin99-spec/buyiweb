const Favorites = require('./favorites');
const { getFavoriteKey } = require('./content-mapper');

module.exports = {
  async getAll() {
    const groups = await Favorites.getGroups();
    return groups.songs || [];
  },

  async add(item) {
    return Favorites.toggle({ ...item, contentType: 'song' });
  },

  async remove(item) {
    return Favorites.toggle({ ...item, contentType: 'song' });
  },

  async isFav(item) {
    const lookup = await Favorites.getLookup();
    return lookup.has(getFavoriteKey({ ...item, contentType: 'song' }));
  },

  async toggle(item) {
    return Favorites.toggle({ ...item, contentType: 'song' });
  },

  subscribe(fn) {
    Favorites.subscribe(fn);
  },

  unsubscribe(fn) {
    Favorites.unsubscribe(fn);
  },
};
