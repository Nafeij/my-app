import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { addAssetsToAlbumAsync, Album, createAssetAsync, getAlbumsAsync, usePermissions } from 'expo-media-library';
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";
import { useManagerPermissions } from "@/hooks/useManagerPermissions";

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
        const fetchedAlbums = await getAlbumsAsync({
            includeSmartAlbums: true,
        });
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
        <ScrollView style={{ flex: 1 }}>
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