# Job Market Dashboard API 文档

## API 端点

### 获取职位列表

```http
GET /api/jobs/fetch_jobs
```

获取职位列表，支持多种过滤条件。

#### 请求参数

| 参数 | 类型 | 必需 | 描述 | 默认值 |
|------|------|------|------|--------|
| query | string | 否 | 搜索关键词 | "developer" |
| location | string | 否 | 地点 | - |
| remote_only | boolean | 否 | 是否只看远程工作 | false |
| min_salary | number | 否 | 最低薪资 | - |
| date_posted | string | 否 | 发布日期（ISO格式） | - |
| max_pages | number | 否 | 最大页数 | 1 |

#### 响应格式

```json
{
  "success": true,
  "message": "Job data fetching completed",
  "jobs": [
    {
      "title": "职位名称",
      "company": "公司名称",
      "location": "工作地点",
      "salary": "薪资范围",
      "apply_link": "申请链接",
      "job_description": "职位描述",
      "posted_at": "发布时间"
    }
  ]
}
```

#### 错误响应

```json
{
  "success": false,
  "error": "错误信息"
}
```

### 添加新职位

```http
POST /api/jobs/jobs
```

添加一个新的职位信息。

#### 请求体

```json
{
  "title": "职位名称",
  "company": "公司名称",
  "location": "工作地点",
  "salary": "薪资范围",
  "apply_link": "申请链接",
  "job_description": "职位描述"
}
```

#### 响应格式

```json
{
  "success": true,
  "job": {
    "title": "职位名称",
    "company": "公司名称",
    "location": "工作地点",
    "salary": "薪资范围",
    "apply_link": "申请链接",
    "job_description": "职位描述",
    "posted_at": "发布时间"
  }
}
```

#### 错误响应

```json
{
  "success": false,
  "error": "错误信息"
}
```

## 数据模型

### Job

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| title | String | 是 | 职位名称 |
| company | String | 是 | 公司名称 |
| location | String | 是 | 工作地点 |
| salary | String | 否 | 薪资范围 |
| apply_link | String | 否 | 申请链接 |
| job_description | String | 否 | 职位描述 |
| posted_at | Date | 否 | 发布时间 |