package com.example.wear_os

import android.util.Log
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class DataLayerListenerService : WearableListenerService() {

    override fun onMessageReceived(messageEvent: MessageEvent) {
        super.onMessageReceived(messageEvent)
        if (messageEvent.path == "/bus_distance") {
            const val TAG = "BusDistance"
            val distance = String(messageEvent.data)
            Log.d(TAG, "Distancia al bus: $distance metros")
            // Here you would typically broadcast this to the UI or update a persistent state
        }
    }
}
