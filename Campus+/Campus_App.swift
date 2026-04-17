//
//  Campus_App.swift
//  Campus+
//
//  Created by Charlie Von Der Ahe on 4/16/26.
//

import SwiftUI
import CoreData

@main
struct Campus_App: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
