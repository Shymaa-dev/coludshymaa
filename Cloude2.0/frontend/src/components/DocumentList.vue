<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="documents"
      :items-per-page="10"
      class="elevation-1"
    >
      <template v-slot:item.title="{ item }">
        <div class="d-flex align-center">
          <v-icon
            :icon="item.fileType === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-file-word-box'"
            class="mr-2"
            :color="item.fileType === 'pdf' ? 'red' : 'blue'"
          ></v-icon>
          {{ item.title }}
        </div>
      </template>

      <template v-slot:item.category="{ item }">
        <v-chip
          :color="getCategoryColor(item.category)"
          size="small"
        >
          {{ item.category }}
        </v-chip>
      </template>

      <template v-slot:item.uploadDate="{ item }">
        {{ new Date(item.uploadDate).toLocaleDateString() }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          color="error"
          size="small"
          @click="confirmDelete(item)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Document</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ selectedDocument?.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="handleDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DocumentList',
  props: {
    documents: {
      type: Array,
      required: true
    }
  },
  emits: ['delete'],
  setup(props, { emit }) {
    const headers = [
      { title: 'Title', key: 'title' },
      { title: 'Category', key: 'category' },
      { title: 'Upload Date', key: 'uploadDate' },
      { title: 'Actions', key: 'actions', sortable: false }
    ]

    const deleteDialog = ref(false)
    const selectedDocument = ref(null)

    const getCategoryColor = (category) => {
      const colors = {
        'Reports': 'blue',
        'Contracts': 'green',
        'Invoices': 'orange',
        'Proposals': 'purple',
        'Other': 'grey'
      }
      return colors[category] || 'grey'
    }

    const confirmDelete = (document) => {
      selectedDocument.value = document
      deleteDialog.value = true
    }

    const handleDelete = () => {
      emit('delete', selectedDocument.value._id)
      deleteDialog.value = false
      selectedDocument.value = null
    }

    return {
      headers,
      deleteDialog,
      selectedDocument,
      getCategoryColor,
      confirmDelete,
      handleDelete
    }
  }
}
</script> 