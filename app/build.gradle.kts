plugins {
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.jetbrainsKotlinAndroid)
}

android {
    namespace = "com.uniquewellness.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.uniquewellness.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            
            signingConfig = signingConfigs.getByName("release")
        }
        
        getByName("debug") {
            isDebuggable = true
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.1"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    signingConfigs {
        create("release") {
            // Configure with your keystore
            keyAlias = project.findProperty("KEYSTORE_ALIAS") as String? ?: "uniquewellness"
            keyPassword = project.findProperty("KEYSTORE_PASSWORD") as String? ?: ""
            storeFile = file(project.findProperty("KEYSTORE_FILE") as String? ?: "keystore.jks")
            storePassword = project.findProperty("KEYSTORE_STORE_PASSWORD") as String? ?: ""
        }
    }
}

dependencies {
    // Capacitor Core
    implementation("com.capacitorjs:core:6.1.2")
    
    // Capacitor Plugins
    implementation("com.capacitorjs:camera:6.1.2")
    implementation("com.capacitorjs:geolocation:6.1.2")
    implementation("com.capacitorjs:keyboard:6.1.2")
    implementation("com.capacitorjs:network:6.1.2")
    implementation("com.capacitorjs:push-notifications:6.1.2")
    implementation("com.capacitorjs:status-bar:6.1.2")
    
    // Android Support Libraries
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.0")
    implementation("androidx.compose.ui:ui:1.6.0")
    implementation("androidx.compose.ui:ui-graphics:1.6.0")
    implementation("androidx.compose.ui:ui-tooling-preview:1.6.0")
    implementation("androidx.compose.material3:material3:1.2.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.6.0")
    debugImplementation("androidx.compose.ui:ui-tooling:1.6.0")
    debugImplementation("androidx.compose.ui:ui-test-manifest:1.6.0")
}
