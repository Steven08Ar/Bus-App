import featureAbility from '@ohos.ability.featureAbility';

export default {
    data: {
        distance: '---'
    },
    onInit() {
        this.subscribeToMessages();
    },
    subscribeToMessages() {
        // Mock implementation for receiving messages from phone
        // In a real scenario, this would use the Wear Engine or similar API
        console.info('Subscribing to messages...');
    }
};
