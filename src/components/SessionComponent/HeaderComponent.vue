<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue"
import axios from 'axios';
import { ElMessage } from "element-plus";
import { ElMessageBox } from 'element-plus'
import { controlledComputed } from "@vueuse/shared";
import {
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
  Edit,
} from '@element-plus/icons-vue'
const emit = defineEmits(['getSession', 'checkFriend'])
const dialogVisible = ref(false)
const props = defineProps(["user1_id", "session_id", "is_friend"])
const user2_id = localStorage.getItem("id")
let user1_username = ref("")
const dropdown1 = ref()
const size = ref('large')
let avatar_url = ref("/api/user/avatar?id="+props.user1_id)
const friends:any = ref([])

const get_friends = () => {
  axios
    .get("/api/user/friends")
    .then((res)=>{
      friends.value = res.data.friends
    })
    .catch((err)=>{
      ElMessage.error(err.response.data)
    })
}

const iconStyle = computed(() => {
  const marginMap:any = {
    large: '8px',
    default: '6px',
    small: '4px',
  }
  return {
    marginRight: marginMap[size.value] || marginMap.default,
  }
})

watch(
    ()=>props.user1_id,
    async (NewId:string)=>{
      if(NewId!=null){
        avatar_url.value="/api/user/avatar?id="+props.user1_id
        getUser(NewId)
      }else{
        ElMessage.error("User state error!")
      }
        //console.log(props.user1_id)
    }
)

const getUser = (id:string) => {
axios
  .get("/api/user/username?id="+id)
  .then((res)=>{
    console.log(res.data)
    user1_username.value = res.data.username
  })
}
//console.log(user1_id.value)
function showClick() {
  dropdown1.value.handleOpen()
}

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('Are you sure to close this dialog?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}

const addFriend = (id:string) => {
    axios
      .post("/api/user/make_friend", {
        user1_id: id,
        user2_id: localStorage.getItem("id"),
        session_id: props.session_id
      })
      .then((res)=>{
        ElMessage.success(res.data)
        //console.log(props.is_friend)
        emit('checkFriend')
        //console.log(props.is_friend)
      })
      .catch((err)=>{
        ElMessage.error(err.response.data)
      })
}

const deleteFriend = (id:string) => {
  dialogVisible.value = false
  axios
    .delete("/api/user/make_friend?user1_id="+id+"&user2_id="+localStorage.getItem("id"))
    .then((res)=>{
    ElMessage.success(res.data)
    emit('checkFriend')
    })
    .catch((err)=>{
    ElMessage.error(err.response.data)
    });
}

let user_ = ref({
  username: "",
  address: "",
  place: "",
  tel: "",
  remarks: 0
})
const dialogTableVisible = ref(false)

const getProfile = () => {
  axios
    .get("/api/user/profile?id="+props.user1_id)
    .then((res)=>{
      dialogTableVisible.value = true
      user_.value = res.data
    })
}
let visible = ref(false)

let create_group_form:any = ref({
  name: "",
  users:[],
})
const create_group = () => {
  console.log("create group")
  console.log(create_group_form.value)
  axios
    .post("/api/group/group", {
      user2_id: localStorage.getItem("id"),
      users: create_group_form.value.users,
      name: create_group_form.value.name
    })
    .then((res)=>{
      ElMessage.success(res.data)
      emit('getSession')
    })
}
const create = () => {
  visible.value = true
  get_friends()
  create_group_form.value.users = [props.user1_id]
}
</script>
<template>
<div>
    <a-row style="width:100%;height: 60px; padding: 10px;" justify="space-between">
    <a-col :span="1" style="margin-left:10px">
      <div v-if="user_.username!=null">
      <el-avatar @click="" style="cursor: pointer"
          :src="avatar_url"
        />
      </div>
    </a-col>
    <a-col :span="2">
      <a-typography-title :heading="2" :style="{margin: '0 0 0 0'}">
        {{user1_username}}
      </a-typography-title>
    </a-col>
    <a-col :span="1" style="margin-right:10px">
        <div v-if="(props.is_friend==0)">
          <el-dropdown ref="dropdown1" trigger="contextmenu" style="margin-right: 10px">
              <span class="el-dropdown-link">
                  <el-button @click="showClick" style="height: 40px; padding-top: 10px;"><el-icon><MoreFilled /></el-icon></el-button>
              </span>
              <template #dropdown>
              <el-dropdown-menu>
                  <el-dropdown-item @click="addFriend(props.user1_id)"><icon-user-add /> friend</el-dropdown-item>
              </el-dropdown-menu>
              </template>
          </el-dropdown>
        </div>
        <div v-else-if="(props.is_friend==1)">
          <el-dropdown ref="dropdown1" trigger="contextmenu" style="margin-right:10px">
            <span class="el-dropdown-link">
                <el-button @click="showClick" style="height: 40px; padding-top: 10px;"><el-icon><MoreFilled /></el-icon></el-button>
            </span>
            <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="dialogVisible = true">- friend</el-dropdown-item>
                <el-dropdown-item @click="getProfile"><icon-user /> profile</el-dropdown-item>
                <el-dropdown-item @click="create"><icon-user-group /> group</el-dropdown-item>
                <a-modal v-model:visible="visible" @ok="create_group" title="Create Group">
                  <a-form
                    :model="create_group_form"
                    layout="vertical"
                  >
                    <a-form-item
                      label="Group Name"
                      name="group_name"
                      :rules="[
                        {
                          required: true,
                          message: 'Please input group name',
                        },
                        {
                          min: 2,
                          message: 'Please input at least 2 characters',
                        },
                      ]"
                      :validate-trigger="['change','input']"
                    >
                      <a-input v-model="create_group_form.name" />
                    </a-form-item>
                    <a-form-item
                      label="Members"
                      name="group_members"
                      :rules="[
                        {
                          required: true,
                          message: 'Please choose members',
                        },
                        {
                          type: 'array',
                          min: 2,
                          message: 'Please choose at least 2 members',
                        }
                      ]"
                      :validate-trigger="['change','input']"
                    >
                      <a-select :default-value="[props.user1_id]" v-model="create_group_form.users" :min-tag-count="2" mode="tags" placeholder="Please select" multiple allow-search>
                        <a-option v-for="item of friends" :value="item.id" >
                          {{ item.username }}
                        </a-option>
                      </a-select>
                    </a-form-item>
                  </a-form>
                </a-modal>
            </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dialog
            v-model="dialogVisible"
            title="Wait a moment..."
            width="30%"
            :before-close="handleClose"
          >
            <span>Are you sure to delete your friend {{user1_username}}</span>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="deleteFriend(props.user1_id)">
                  Confirm
                </el-button>
              </span>
            </template>
          </el-dialog>
        </div>
    </a-col>
    </a-row>
</div>

<el-dialog v-model="dialogTableVisible">
  <el-descriptions
        class="margin-top"
        title="Information"
        :column="2"
        :size="size"
        border
        style="position:relative;top:-40px"
      >
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            Username
          </div>
        </template>
        {{user_.username}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <iphone />
            </el-icon>
            Telephone
          </div>
        </template>
        {{user_.tel}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <location />
            </el-icon>
            Place
          </div>
        </template>
        {{user_.place}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <tickets />
            </el-icon>
            Remarks
          </div>
        </template>
        <div v-if="(user_.remarks==0)">
          <el-tag size="small">School</el-tag>
        </div>
        <div v-else-if="(user_.remarks==1)">
          <el-tag size="small">Office</el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <office-building />
            </el-icon>
            Address
          </div>
        </template>
        {{user_.address}}
      </el-descriptions-item>
      </el-descriptions>
  </el-dialog>
</template>

<style scoped>
.el-descriptions {
  margin-top: 20px;
}
.cell-item {
  display: flex;
  align-items: center;
}
.margin-top {
  margin-top: 20px;
}
</style>

