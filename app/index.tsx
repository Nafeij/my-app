import { ThemedText } from "@/components/ThemedText";
import { useManagerPermissions } from "@/hooks/useManagerPermissions";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import { addAssetsToAlbumAsync, Album, createAssetAsync, getAlbumsAsync, usePermissions } from 'expo-media-library';
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

export default function App() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [permissionResponse, requestPermission] = usePermissions();
    const [managerPermission, requestManagerPermission] = useManagerPermissions();

    async function getAlbums() {
        if (permissionResponse?.status !== 'granted') {
            await requestPermission();
        }
        if (managerPermission?.status !== 'granted') {
            await requestManagerPermission();
        }
        const fetchedAlbums = await getAlbumsAsync({ includeSmartAlbums: true });
        setAlbums(fetchedAlbums);
    }

    useEffect(() => {
        getAlbums();
    }, []);

    async function addPic(album: Album) {
        let result = await launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.All,
            quality: 1,
        });

        // Add the picture to the album
        if (!result.canceled) {
            console.log(result.assets[0].uri);
            const asset = await createAssetAsync(result.assets[0].uri);

            await addAssetsToAlbumAsync(asset, album, false);
        }
    }

    return (
        <ScrollView style={{ flex: 1 }}
            refreshControl={
                <RefreshControl
                    refreshing={albums.length === 0}
                    onRefresh={getAlbums}
                />
            }
        >
            <Stack.Screen options={{ title: "Pick destination album" }} />
            {
                albums.map((album) => (
                    <Pressable key={album.id} onPress={() => addPic(album)}>
                        <ThemedText style={{ padding: 10 }}>{album.title}</ThemedText>
                    </Pressable>
                ))
            }
        </ScrollView>
    );
}