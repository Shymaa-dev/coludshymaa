<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-title>Document Management System</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card class="mb-4">
              <v-card-title>Upload Document</v-card-title>
              <v-card-text>
                <v-file-input
                  v-model="selectedFile"
                  accept=".pdf,.docx"
                  label="Select PDF or DOCX file"
                  prepend-icon="mdi-file-upload"
                ></v-file-input>
                <v-btn
                  color="primary"
                  :loading="uploading"
                  :disabled="!selectedFile"
                  @click="uploadDocument"
                >
                  Upload
                </v-btn>
                <v-progress-linear
                  v-if="uploading"
                  :model-value="uploadProgress"
                  height="7"
                  color="success"
                  striped
                  class="mt-3"
                ></v-progress-linear>
                <div v-if="uploading" class="text-caption mt-1">Uploading: {{ uploadProgress }}%</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>
                Documents
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>

              <v-card-text>
                <v-tabs v-model="activeTab">
                  <v-tab value="all">All Documents</v-tab>
                  <v-tab value="reports">Reports</v-tab>
                  <v-tab value="contracts">Contracts</v-tab>
                  <v-tab value="invoices">Invoices</v-tab>
                  <v-tab value="proposals">Proposals</v-tab>
                  <v-tab value="other">Other</v-tab>
                </v-tabs>

                <v-window v-model="activeTab">
                  <v-window-item value="all">
                    <document-list :documents="filteredDocuments" @delete="deleteDocument" />
                  </v-window-item>
                  <v-window-item v-for="category in categories" :key="category" :value="category">
                    <document-list
                      :documents="filteredDocuments.filter(doc => doc.category === category)"
                      @delete="deleteDocument"
                    />
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import DocumentList from './components/DocumentList.vue'

export default {
  name: 'App',
  components: {
    DocumentList
  },
  setup() {
    const documents = ref([])
    const selectedFile = ref(null)
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const search = ref('')
    const activeTab = ref('all')
    const snackbar = ref({
      show: false,
      text: '',
      color: 'success'
    })

    const categories = ['reports', 'contracts', 'invoices', 'proposals', 'other']

    const filteredDocuments = computed(() => {
      return documents.value.filter(doc => 
        doc.title.toLowerCase().includes(search.value.toLowerCase()) ||
        doc.originalName.toLowerCase().includes(search.value.toLowerCase())
      )
    })

    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/documents')
        documents.value = response.data
      } catch (error) {
        showSnackbar('Error fetching documents', 'error')
      }
    }

    const uploadDocument = async () => {
      if (!selectedFile.value) {
        showSnackbar('Please select a file to upload.', 'warning')
        return
      }

      const file = selectedFile.value
      console.log('File to upload:', file)
      console.log('File type to upload:', file.type)

      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        showSnackbar('Invalid file type. Only PDF and DOCX files are allowed.', 'error')
        selectedFile.value = null // Clear the input
        return
      }

      uploading.value = true
      uploadProgress.value = 0
      const formData = new FormData()
      formData.append('file', file)

      try {
        await axios.post('http://localhost:3000/api/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            uploadProgress.value = percentCompleted;
          },
        })
        showSnackbar('Document uploaded successfully')
        selectedFile.value = null
        await fetchDocuments()
      } catch (error) {
        showSnackbar(error.response?.data?.error || 'Error uploading document', 'error')
      } finally {
        uploading.value = false
        uploadProgress.value = 0
      }
    }

    const deleteDocument = async (id) => {
      try {
        await axios.delete(`http://localhost:3000/api/documents/${id}`)
        showSnackbar('Document deleted successfully')
        await fetchDocuments()
      } catch (error) {
        showSnackbar('Error deleting document', 'error')
      }
    }

    const showSnackbar = (text, color = 'success') => {
      snackbar.value = {
        show: true,
        text,
        color
      }
    }

    onMounted(fetchDocuments)

    watch(selectedFile, (newValue) => {
      if (newValue) {
        console.log('Selected file (from v-model watch):', newValue);
        console.log('Selected file type (from v-model watch):', newValue.type);
      }
    });

    return {
      documents,
      selectedFile,
      uploading,
      uploadProgress,
      search,
      activeTab,
      categories,
      snackbar,
      filteredDocuments,
      uploadDocument,
      deleteDocument
    }
  }
}
</script>

<style>
.v-application {
  font-family: 'Roboto', sans-serif;
}
</style>
