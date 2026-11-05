import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Platform } from "react-native";
import {
  Appbar,
  Card,
  Button,
  IconButton,
  Snackbar,
  useTheme,
} from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import ImageViewer from "react-native-image-zoom-viewer";

import { useLocalSearchParams, router } from "expo-router";
import { scale, verticalScale } from "@/utils/common";
import { useDispatch, useSelector } from "react-redux";

import * as FileSystem from "expo-file-system/legacy";

import {
  fetchReports,
  uploadReports,
} from "@/store/features/uploaded_reports/uploadedReportsSlice";
import { AppDispatch } from "@/store";

export default function ViewReport() {
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();

  const [reports, setReports] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const { patientId, patientName } = useLocalSearchParams();
  const Doctor_info = useSelector((state: any) => state.appointment.data);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  // Fetch reports
  async function getPatientReports(id: number) {
    try {
      setLoadingReports(true);
      const res = await dispatch(fetchReports(id)).unwrap();
      setReports(res || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    if (patientId) {
      getPatientReports(Number(patientId));
    }
  }, [patientId]);

  // Upload file
const uploadReport = async () => {

  try {

    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) return;

    setUploading(true);

    const file = result.assets[0];

    console.log("platform :", Platform.OS);

    // =========================
    // WEB FLOW (UNCHANGED)
    // =========================

    if (Platform.OS === "web") {

      const response = await fetch(file.uri);

      const blob = await response.blob();

      const formData = new FormData();

      formData.append(
        "patient_id",
        String(patientId)
      );

      formData.append(
        "app_id",
        String(Doctor_info?.app_info?.id || "")
      );

      formData.append(
        "pharmaclient_id",
        String(
          Doctor_info?.doctors[0]?.pharmaclient_id || ""
        )
      );

      formData.append(
        "report_file",
        blob,
        file.name || "upload"
      );

      await dispatch(
        uploadReports(formData)
      ).unwrap();

    }

    // =========================
    // EXPO ANDROID / IOS
    // =========================

    else {

      console.log("MOBILE FILE :", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });

      const uploadResult =
        await FileSystem.uploadAsync(

          "https://api-staging.docexa.com/api/v4/patient/upload_report",

          file.uri,

          {
            fieldName: "report_file",

            httpMethod: "POST",

            uploadType:
              1,

            parameters: {

              patient_id: String(patientId),

              app_id: String(
                Doctor_info?.app_info?.id || ""
              ),

              pharmaclient_id: String(
                Doctor_info?.doctors[0]?.pharmaclient_id || ""
              ),
            },

            headers: {
              Accept: "application/json",

              // Add token if needed
              // Authorization: `Bearer ${token}`,
            },
          }
        );

      console.log(
        "UPLOAD RESULT :",
        uploadResult
      );

      if (uploadResult.status !== 200) {

        throw new Error(
          "Upload failed"
        );
      }
    }

    // Refresh reports
    await getPatientReports(Number(patientId));

    setSnackbarMsg(
      "Report uploaded successfully"
    );

    setSnackbarVisible(true);

  } catch (error) {

    console.log(
      "Upload error:",
      error
    );

    setSnackbarMsg("Upload failed");

    setSnackbarVisible(true);

  } finally {

    setUploading(false);
  }
};

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Render each report
  const renderReport = ({ item }: { item: any }) => {
    const mimeType = item.mime_type?.toLowerCase() || "";
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType.includes("pdf");

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.reportDate}>
            Uploaded: {formatDate(item.created_at)}
          </Text>

          {/* Preview */}
          <TouchableOpacity
            onPress={() => {
              if (isImage) {
                setSelectedImage(item.file_path);
                setModalVisible(true);
              } else {
                Linking.openURL(item.file_path);
              }
            }}
          >
            {isImage ? (
              <Image
                source={{ uri: item.file_path }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.fileBox}>
                <Text style={{ fontSize: 32 }}>{isPdf ? "📄" : "📎"}</Text>
                <Text style={{ marginTop: 6, fontWeight: "600" }}>
                  {item.file_name}
                </Text>
                <Text style={{ fontSize: 12, color: "#777" }}>Tap to open</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actionRow}>
            {/* View Comments */}
            <Button
              mode="outlined"
              compact
              icon="comment-text-outline"
              style={{ borderRadius: 20 }}
              disabled={!item.report_data || item.report_data.trim() === ""}
              onPress={() => {
                setSelectedComment(item.report_data);
                setCommentsVisible(true);
              }}
            >
              View Comments
            </Button>

            {/* Right Icons */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon="download"
                size={22}
                onPress={() => Linking.openURL(item.file_path)}
              />

              <IconButton
                icon="check-all"
                size={22}
                iconColor={item.seen_by_doctor == 1 ? "#00a9f2" : "#bbb"}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={"Reports"} titleStyle={{ fontWeight: "bold" }} />
      </Appbar.Header>

      {/* Upload button */}
      <View style={styles.uploadCard}>
        {/* Patient Info */}
        <View style={styles.patientInfo}>
          <View style={styles.avatarCircle}>
            <IconButton icon="account" size={22} iconColor="#fff" />
          </View>

          <View>
            <Text style={styles.patientName}>{patientName || "Patient"}</Text>
            <Text style={styles.patientSub}>Reports & Documents</Text>
          </View>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          onPress={uploadReport}
          disabled={uploading}
          style={[
            styles.uploadButtonModern,
            { backgroundColor: uploading ? "#999" : theme.colors.primary },
          ]}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <IconButton
                icon="upload"
                size={18}
                iconColor="#fff"
                style={{ margin: 0 }}
              />
              <Text style={styles.uploadText}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Reports list */}
      {loadingReports ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReport}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reports available</Text>
          }
        />
      )}

      {/* Image Viewer */}
      <Modal visible={modalVisible} transparent>
        <ImageViewer
          imageUrls={[{ url: selectedImage || "" }]}
          enableSwipeDown
          onSwipeDown={() => setModalVisible(false)}
        />
      </Modal>

      {/* Comments Modal */}
      <Modal visible={commentsVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.commentsBox}>
            <Text style={styles.commentsTitle}>Report Comment</Text>

            {selectedComment ? (
              <Text style={styles.commentText}>{selectedComment}</Text>
            ) : (
              <Text style={styles.commentText}>No comments available</Text>
            )}

            <Button
              mode="contained"
              onPress={() => setCommentsVisible(false)}
              style={{ marginTop: 12 }}
            >
              Close
            </Button>
          </View>
        </View>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  fileBox: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
  },
  reportDate: {
    marginBottom: 6,
    color: "#666",
  },
  uploadContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  uploadText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  commentsBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 6,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  uploadCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10, // 👈 add this
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },

  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6C8EF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  patientSub: {
    fontSize: 12,
    color: "#777",
  },

  uploadButtonModern: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
});
