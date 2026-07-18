export const notificationService = {
  getNotifications() {
    const list = localStorage.getItem('notifications');
    return list ? JSON.parse(list) : [];
  },

  saveNotification(notification) {
    const list = this.getNotifications();
    // Wrap details
    const newNotif = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    const newList = [newNotif, ...list].slice(0, 50); // Keep last 50
    localStorage.setItem('notifications', JSON.stringify(newList));
    return newList;
  },

  markAsRead(id) {
    const list = this.getNotifications();
    const newList = list.map((item) => 
      item.id === id ? { ...item, read: true } : item
    );
    localStorage.setItem('notifications', JSON.stringify(newList));
    return newList;
  },

  clearAll() {
    localStorage.removeItem('notifications');
    return [];
  }
};

export default notificationService;
