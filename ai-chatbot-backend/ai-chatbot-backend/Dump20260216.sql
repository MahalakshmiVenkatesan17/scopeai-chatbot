-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ai_chatbot_saas
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_usage_logs`
--

DROP TABLE IF EXISTS `api_usage_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_usage_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endpoint` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_size` int DEFAULT NULL,
  `response_size` int DEFAULT NULL,
  `response_time_ms` int DEFAULT NULL,
  `status_code` int DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `session_id` (`session_id`),
  KEY `idx_usage_tenant` (`tenant_id`),
  KEY `idx_usage_endpoint` (`endpoint`),
  KEY `idx_usage_created` (`created_at`),
  KEY `idx_api_usage_tenant_created` (`tenant_id`,`created_at`),
  CONSTRAINT `api_usage_logs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `api_usage_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `api_usage_logs_ibfk_3` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_usage_logs`
--

LOCK TABLES `api_usage_logs` WRITE;
/*!40000 ALTER TABLE `api_usage_logs` DISABLE KEYS */;
INSERT INTO `api_usage_logs` VALUES (1,1,3,'550e8400-e29b-41d4-a716-446655440001','/api/chat','POST',256,1024,1250,200,'192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-11 11:19:04'),(2,1,3,'550e8400-e29b-41d4-a716-446655440001','/api/chat','POST',198,856,980,200,'192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-11 11:21:04'),(3,1,1,NULL,'/api/upload-pdfs','POST',2048576,512,5600,200,'192.168.1.101','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-08 13:19:04'),(4,1,1,'550e8400-e29b-41d4-a716-446655440004','/api/chat','POST',287,1123,1350,200,'192.168.1.101','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-08 13:19:04'),(5,1,2,NULL,'/api/reindex','POST',128,256,15000,200,'192.168.1.102','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-10 13:19:04'),(6,2,6,'550e8400-e29b-41d4-a716-446655440002','/api/chat','POST',312,1456,1800,200,'10.0.0.50','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',NULL,'2026-02-10 13:19:04'),(7,2,6,'550e8400-e29b-41d4-a716-446655440002','/api/chat','POST',245,1234,1650,200,'10.0.0.50','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',NULL,'2026-02-10 13:21:04'),(8,2,5,NULL,'/api/stats','GET',0,2048,320,200,'10.0.0.51','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',NULL,'2026-02-11 09:19:04'),(9,2,5,'550e8400-e29b-41d4-a716-446655440008','/api/chat','POST',298,1367,1750,200,'10.0.0.51','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',NULL,'2026-02-09 13:19:04'),(10,3,NULL,'550e8400-e29b-41d4-a716-446655440003','/api/chat','POST',287,1123,1100,200,'172.16.0.25','Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',NULL,'2026-02-11 12:51:04'),(11,3,NULL,'550e8400-e29b-41d4-a716-446655440003','/api/chat','POST',234,1089,1150,200,'172.16.0.25','Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',NULL,'2026-02-11 12:53:04'),(12,3,8,NULL,'/api/upload-pdfs','POST',2560000,456,8900,200,'172.16.0.26','Mozilla/5.0 (X11; Linux x86_64)',NULL,'2026-02-06 13:19:04'),(13,6,15,'550e8400-e29b-41d4-a716-446655440005','/api/chat','POST',289,1245,1920,200,'198.51.100.78','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-11 12:29:04'),(14,6,13,NULL,'/api/health','GET',0,512,145,200,'198.51.100.79','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-11 11:19:04'),(15,6,14,NULL,'/api/upload-pdfs','POST',4608000,678,12300,200,'198.51.100.80','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-10 13:19:04'),(16,7,16,'550e8400-e29b-41d4-a716-446655440006','/api/chat','POST',298,1145,1080,200,'192.0.2.134','Mozilla/5.0 (iPad; CPU OS 14_7_1)',NULL,'2026-02-11 10:19:04'),(17,7,17,NULL,'/api/stats','GET',0,1876,245,200,'192.0.2.135','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',NULL,'2026-02-11 07:19:04'),(18,8,19,'550e8400-e29b-41d4-a716-446655440007','/api/chat','POST',267,1198,1180,200,'203.0.113.156','Mozilla/5.0 (X11; Linux x86_64)',NULL,'2026-02-11 12:59:04'),(19,8,18,NULL,'/api/upload-pdfs','POST',1920000,423,7800,200,'203.0.113.157','Mozilla/5.0 (X11; Linux x86_64)',NULL,'2026-02-09 13:19:04');
/*!40000 ALTER TABLE `api_usage_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resource_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `success` tinyint(1) DEFAULT '1',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_tenant` (`tenant_id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_resource` (`resource_type`,`resource_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,1,'document.upload','document','2',NULL,'{\"size\": 1536000, \"category\": \"API Documentation\", \"filename\": \"api-reference.pdf\"}','192.168.1.101','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1,NULL,'2026-02-11 13:19:04'),(2,1,1,'user.login','user','1',NULL,'{\"ip\": \"192.168.1.100\", \"login_time\": \"2024-01-15T08:30:00Z\"}','192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1,NULL,'2026-02-11 13:19:04'),(3,1,2,'user.profile.update','user','2','{\"last_name\": \"Johnson\", \"first_name\": \"Jane\"}','{\"last_name\": \"Johnson-Smith\", \"first_name\": \"Jane\"}','192.168.1.103','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1,NULL,'2026-02-11 13:19:04'),(4,1,3,'chat.session.start','chat_session','550e8400-e29b-41d4-a716-446655440001',NULL,'{\"documents\": [1, 2], \"started_at\": \"2024-01-15T08:30:00Z\"}','192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1,NULL,'2026-02-11 13:19:04'),(5,2,5,'subscription.upgrade','subscription','2','{\"plan\": \"basic\", \"amount\": 29.0}','{\"plan\": \"pro\", \"amount\": 99.0}','10.0.0.50','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',1,NULL,'2026-02-11 13:19:04'),(6,2,6,'document.delete','document','7','{\"size\": 1024000, \"filename\": \"old-marketing.pdf\"}',NULL,'10.0.0.51','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',1,NULL,'2026-02-11 13:19:04'),(7,2,5,'settings.update','tenant_configuration','10','{\"enable_analytics\": \"false\"}','{\"enable_analytics\": \"true\"}','10.0.0.50','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',1,NULL,'2026-02-11 13:19:04'),(8,3,8,'settings.update','tenant_configuration','15','{\"enable_analytics\": \"true\"}','{\"enable_analytics\": \"false\"}','172.16.0.25','Mozilla/5.0 (X11; Linux x86_64)',1,NULL,'2026-02-11 13:19:04'),(9,3,9,'password.reset.attempt','user','9',NULL,'{\"success\": false, \"timestamp\": \"2024-01-14T15:20:00Z\"}','172.16.0.26','Mozilla/5.0 (X11; Linux x86_64)',0,NULL,'2026-02-11 13:19:04'),(10,3,10,'document.view','document','8',NULL,'{\"session\": \"550e8400-e29b-41d4-a716-446655440003\", \"viewed_at\": \"2024-01-15T10:15:00Z\"}','172.16.0.25','Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)',1,NULL,'2026-02-11 13:19:04'),(11,6,13,'user.create','user','15',NULL,'{\"role\": \"customer\", \"email\": \"analyst@globalenterprise.com\", \"created_by\": 13}','198.51.100.79','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1,NULL,'2026-02-11 13:19:04'),(12,6,14,'security.policy.update','tenant_configuration','22','{\"security_level\": \"standard\"}','{\"security_level\": \"enterprise\"}','198.51.100.80','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1,NULL,'2026-02-11 13:19:04'),(13,6,15,'api.key.rotation','tenant_configuration','20','{\"last_rotated\": \"2024-01-01T00:00:00Z\"}','{\"last_rotated\": \"2024-01-15T10:00:00Z\"}','198.51.100.78','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1,NULL,'2026-02-11 13:19:04'),(14,7,16,'integration.setup','tenant_configuration','28',NULL,'{\"enabled\": true, \"slack_webhook\": \"https://hooks.slack.com/xxx\"}','192.0.2.134','Mozilla/5.0 (iPad; CPU OS 14_7_1)',1,NULL,'2026-02-11 13:19:04'),(15,7,17,'billing.update','subscription','7','{\"amount\": 99.0}','{\"amount\": 149.0}','192.0.2.135','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1,NULL,'2026-02-11 13:19:04'),(16,8,18,'volunteer.access.granted','user','19','{\"role\": \"customer\"}','{\"role\": \"customer\", \"volunteer_access\": true}','203.0.113.157','Mozilla/5.0 (X11; Linux x86_64)',1,NULL,'2026-02-11 13:19:04'),(17,8,19,'program.guideline.update','document','14','{\"version\": 1}','{\"version\": 2, \"updated_sections\": [\"eligibility\", \"requirements\"]}','203.0.113.156','Mozilla/5.0 (X11; Linux x86_64)',1,NULL,'2026-02-11 13:19:04');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int NOT NULL,
  `message_type` enum('user','assistant','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_count` int DEFAULT NULL,
  `model_used` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `context_chunks` json DEFAULT NULL,
  `processing_time_ms` int DEFAULT NULL,
  `cost_estimate` decimal(10,6) DEFAULT NULL,
  `feedback_rating` tinyint DEFAULT NULL,
  `feedback_comment` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_message_session` (`session_id`),
  KEY `idx_message_tenant` (`tenant_id`),
  KEY `idx_message_type` (`message_type`),
  KEY `idx_message_created` (`created_at`),
  KEY `idx_chat_messages_session_created` (`session_id`,`created_at`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,'550e8400-e29b-41d4-a716-446655440001',1,'user','How do I reset my password?','msg_hash_001',8,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-15T10:30:00Z\", \"user_agent\": \"chrome\"}','2026-02-11 13:19:04'),(2,'550e8400-e29b-41d4-a716-446655440001',1,'assistant','To reset your password, you can follow these steps from our user manual: 1) Go to the login page, 2) Click \"Forgot Password\", 3) Enter your email address, 4) Check your email for reset instructions. The reset link will be valid for 24 hours.','msg_hash_002',52,'gpt-3.5-turbo','[1]',1250,0.002500,5,'Very helpful and clear!','{\"timestamp\": \"2024-01-15T10:30:05Z\", \"context_used\": true}','2026-02-11 13:19:04'),(3,'550e8400-e29b-41d4-a716-446655440001',1,'user','What are the system requirements?','msg_hash_003',7,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-15T10:32:00Z\", \"user_agent\": \"chrome\"}','2026-02-11 13:19:04'),(4,'550e8400-e29b-41d4-a716-446655440001',1,'assistant','According to our documentation, the system requirements are: Modern web browser (Chrome, Firefox, Safari, Edge), stable internet connection with at least 5 Mbps speed, and JavaScript enabled. No additional software installation is required.','msg_hash_004',42,'gpt-3.5-turbo','[1]',980,0.001960,4,'Good information','{\"timestamp\": \"2024-01-15T10:32:03Z\", \"context_used\": true}','2026-02-11 13:19:04'),(5,'550e8400-e29b-41d4-a716-446655440002',2,'user','What is our projected revenue growth for 2024?','msg_hash_005',10,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-14T15:20:00Z\", \"user_agent\": \"firefox\"}','2026-02-11 13:19:04'),(6,'550e8400-e29b-41d4-a716-446655440002',2,'assistant','Based on our business plan, we are projecting 300% revenue growth for 2024 through strategic market expansion and innovative product launches. This ambitious target is supported by our comprehensive market analysis and strategic initiatives.','msg_hash_006',38,'gpt-4','[5]',1800,0.008400,5,'Exactly what I needed','{\"timestamp\": \"2024-01-14T15:20:04Z\", \"context_used\": true}','2026-02-11 13:19:04'),(7,'550e8400-e29b-41d4-a716-446655440002',2,'user','What marketing strategies are we implementing?','msg_hash_007',8,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-14T15:22:00Z\", \"user_agent\": \"firefox\"}','2026-02-11 13:19:04'),(8,'550e8400-e29b-41d4-a716-446655440002',2,'assistant','Our Q1 marketing strategy focuses on digital marketing campaigns, content marketing, and strategic partnerships. We are implementing multi-channel approaches to reach our target audience effectively and maximize customer acquisition.','msg_hash_008',35,'gpt-4','[6]',1650,0.007350,4,NULL,'{\"timestamp\": \"2024-01-14T15:22:03Z\", \"context_used\": true}','2026-02-11 13:19:04'),(9,'550e8400-e29b-41d4-a716-446655440003',3,'user','What should I do first when I start my shift?','msg_hash_009',12,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-15T14:30:00Z\", \"user_agent\": \"safari\"}','2026-02-11 13:19:04'),(10,'550e8400-e29b-41d4-a716-446655440003',3,'assistant','According to our operations manual, when starting your shift you should: 1) Review the task queue, 2) Check inventory levels, 3) Ensure all systems are operational. This systematic approach helps maintain consistent service quality.','msg_hash_010',38,'gpt-3.5-turbo','[8]',1100,0.002200,NULL,NULL,'{\"timestamp\": \"2024-01-15T14:30:03Z\", \"context_used\": true}','2026-02-11 13:19:04'),(11,'550e8400-e29b-41d4-a716-446655440003',3,'user','How should I handle difficult customers?','msg_hash_011',8,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-15T14:32:00Z\", \"user_agent\": \"safari\"}','2026-02-11 13:19:04'),(12,'550e8400-e29b-41d4-a716-446655440003',3,'assistant','When dealing with difficult customers, always remain calm and professional. Listen actively to their concerns, acknowledge their feelings, and work together to find a solution. Follow up to ensure their satisfaction and build trust.','msg_hash_012',39,'gpt-3.5-turbo','[9]',1150,0.002300,NULL,NULL,'{\"timestamp\": \"2024-01-15T14:32:04Z\", \"context_used\": true}','2026-02-11 13:19:04'),(13,'550e8400-e29b-41d4-a716-446655440004',1,'user','How do I authenticate with the API?','msg_hash_013',9,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-12T09:15:00Z\", \"user_agent\": \"chrome\"}','2026-02-11 13:19:04'),(14,'550e8400-e29b-41d4-a716-446655440004',1,'assistant','To authenticate with our API, you need to include a valid JWT token in the Authorization header of each request. You can obtain tokens by making a POST request to /api/auth/login with your valid credentials.','msg_hash_014',41,'gpt-3.5-turbo','[2]',1350,0.002700,5,'Perfect explanation','{\"timestamp\": \"2024-01-12T09:15:04Z\", \"context_used\": true}','2026-02-11 13:19:04'),(15,'550e8400-e29b-41d4-a716-446655440005',6,'user','What security framework does the company use?','msg_hash_015',9,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-15T16:10:00Z\", \"user_agent\": \"edge\"}','2026-02-11 13:19:04'),(16,'550e8400-e29b-41d4-a716-446655440005',6,'assistant','Our enterprise security framework is built on zero-trust principles, implementing multi-layered security controls across all systems and data. This comprehensive approach ensures robust protection against evolving cyber threats.','msg_hash_016',34,'gpt-4','[11]',1920,0.009600,5,'Comprehensive answer','{\"timestamp\": \"2024-01-15T16:10:05Z\", \"context_used\": true}','2026-02-11 13:19:04'),(17,'550e8400-e29b-41d4-a716-446655440006',7,'user','What are the key features in version 3.2?','msg_hash_017',10,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-15T13:20:00Z\", \"user_agent\": \"chrome\"}','2026-02-11 13:19:04'),(18,'550e8400-e29b-41d4-a716-446655440006',7,'assistant','Version 3.2 includes several key enhancements: improved performance optimization, enhanced user interface, advanced analytics dashboard, and new integration capabilities. These updates provide better user experience and functionality.','msg_hash_018',33,'gpt-3.5-turbo','[13]',1080,0.002160,4,NULL,'{\"timestamp\": \"2024-01-15T13:20:03Z\", \"context_used\": true}','2026-02-11 13:19:04'),(19,'550e8400-e29b-41d4-a716-446655440008',2,'user','What channels should we focus on for our Q1 campaign?','msg_hash_021',12,NULL,NULL,NULL,NULL,NULL,NULL,'{\"timestamp\": \"2024-01-13T11:30:00Z\", \"user_agent\": \"safari\"}','2026-02-11 13:19:04'),(20,'550e8400-e29b-41d4-a716-446655440008',2,'assistant','For Q1, our marketing strategy recommends focusing on digital channels including social media marketing, content marketing, email campaigns, and strategic partnerships. These channels offer the best ROI and reach for our target audience.','msg_hash_022',39,'gpt-4','[6]',1750,0.008750,5,'Strategic insight','{\"timestamp\": \"2024-01-13T11:30:04Z\", \"context_used\": true}','2026-02-11 13:19:04'),(24,'3dd1af60-28f5-41ea-b21d-cc5d14095098',1,'assistant','No relevant document context found for your query.',NULL,0,'none','null',65892,0.000000,NULL,NULL,NULL,'2026-02-11 15:19:51');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_sessions`
--

DROP TABLE IF EXISTS `chat_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_sessions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `session_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `context_documents` json DEFAULT NULL,
  `session_metadata` json DEFAULT NULL,
  `status` enum('active','ended','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` timestamp NULL DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_tenant` (`tenant_id`),
  KEY `idx_session_user` (`user_id`),
  KEY `idx_session_status` (`status`),
  KEY `idx_session_activity` (`last_activity`),
  KEY `idx_chat_sessions_tenant_activity` (`tenant_id`,`last_activity`),
  CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_sessions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_sessions`
--

LOCK TABLES `chat_sessions` WRITE;
/*!40000 ALTER TABLE `chat_sessions` DISABLE KEYS */;
INSERT INTO `chat_sessions` VALUES ('11e7babc-316f-4233-a5b7-4e058839a6a3',1,NULL,'Public Chat 2026-02-15 15:11',NULL,'{\"metadata\": null, \"visitorId\": \"visitor_0e947e0e1f164b9f8f5cae0e\", \"visitorName\": null, \"sessionToken\": \"sess_b14459b33cc28d3476ead933738e71019894a7700af31828\", \"visitorEmail\": null}','active','127.0.0.1','curl/8.12.1','2026-02-15 15:11:23',NULL,'2026-02-15 15:11:23'),('2c3a19b8-ffd2-4191-9174-abdb8c08d53c',1,NULL,'Public Chat 2026-02-15 15:40',NULL,'{\"metadata\": null, \"visitorId\": \"visitor_921b93c9c447ab0149168f0f\", \"visitorName\": null, \"sessionToken\": \"sess_98f6176063b2e2700e9de70b38f4f4e5a29430fc1c9caf36\", \"visitorEmail\": null}','active','127.0.0.1','python-requests/2.32.5','2026-02-15 15:40:57',NULL,'2026-02-15 15:40:57'),('2fa80bf2-ca49-4628-b01d-410fb045d12b',1,NULL,'Public Chat 2026-02-11 14:56',NULL,'{\"metadata\": null, \"visitorName\": \"V\", \"sessionToken\": \"IDmTxl4sTE7EMYka9NgyToEHyhwi0LUXJX8XZxtY_js\", \"visitorEmail\": \"v_1770821774@t.com\"}','ended','127.0.0.1','python-requests/2.32.3','2026-02-11 14:56:39','2026-02-11 14:56:44','2026-02-11 14:56:43'),('3dd1af60-28f5-41ea-b21d-cc5d14095098',1,NULL,'Public Chat 2026-02-11 15:18',NULL,'{\"metadata\": null, \"visitorName\": null, \"sessionToken\": \"5NYA3lptmFAPhafdCUIXpw5oYSlYblXU25djxIQ4TIw\", \"visitorEmail\": null}','ended','127.0.0.1','curl/8.16.0','2026-02-11 15:18:44','2026-02-11 15:19:52','2026-02-11 15:19:52'),('4eff136b-43ce-4cea-9159-49c30c3c4c2a',1,NULL,'Public Chat 2026-02-11 16:17',NULL,'{\"metadata\": null, \"visitorName\": \"Visitor EP\", \"sessionToken\": \"YcBz77hy_oh0NS5dPQcvvBdaGUre1jPkjVkqoQUEgpo\", \"visitorEmail\": \"visitor_ep2@test.com\"}','active','127.0.0.1','python-httpx/0.28.1','2026-02-11 16:17:38',NULL,'2026-02-11 16:17:38'),('50539cb4-4071-4257-bd58-5c5cfedbab3b',1,NULL,'Public Chat 2026-02-15 15:46',NULL,'{\"metadata\": null, \"visitorId\": \"visitor_acec4ece35d0f2f8b69acedb\", \"visitorName\": null, \"sessionToken\": \"sess_c4a4804399e79869c7631b144eaa08cf2a6ec08bf34b174f\", \"visitorEmail\": null}','active','127.0.0.1','python-requests/2.32.5','2026-02-15 15:46:08',NULL,'2026-02-15 15:46:08'),('550e8400-e29b-41d4-a716-446655440001',1,3,'Product Help Session','[1, 2]','{\"device\": \"desktop\", \"browser\": \"chrome\", \"referrer\": \"dashboard\"}','active','192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','2026-02-11 11:19:04',NULL,'2026-02-11 13:14:04'),('550e8400-e29b-41d4-a716-446655440002',2,6,'Business Strategy Discussion','[5, 7]','{\"device\": \"laptop\", \"browser\": \"firefox\", \"referrer\": \"direct\"}','ended','10.0.0.50','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','2026-02-10 13:19:04',NULL,'2026-02-10 17:19:04'),('550e8400-e29b-41d4-a716-446655440003',3,NULL,'Anonymous Support','[8, 9]','{\"device\": \"mobile\", \"browser\": \"safari\", \"referrer\": \"google\"}','active','172.16.0.25','Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)','2026-02-11 12:49:04',NULL,'2026-02-11 13:17:04'),('550e8400-e29b-41d4-a716-446655440004',1,1,'API Documentation Query','[2]','{\"device\": \"desktop\", \"browser\": \"chrome\", \"referrer\": \"documentation\"}','ended','192.168.1.101','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','2026-02-08 13:19:04',NULL,'2026-02-08 13:19:04'),('550e8400-e29b-41d4-a716-446655440005',6,15,'Enterprise Security Inquiry','[11, 12]','{\"device\": \"desktop\", \"browser\": \"edge\", \"referrer\": \"intranet\"}','active','198.51.100.78','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','2026-02-11 12:19:04',NULL,'2026-02-11 13:09:04'),('550e8400-e29b-41d4-a716-446655440006',7,16,'Product Specification Help','[13]','{\"device\": \"tablet\", \"browser\": \"chrome\", \"referrer\": \"support_portal\"}','ended','192.0.2.134','Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)','2026-02-11 09:19:04',NULL,'2026-02-11 10:19:04'),('550e8400-e29b-41d4-a716-446655440007',8,19,'Program Guidelines Question','[14]','{\"device\": \"desktop\", \"browser\": \"firefox\", \"referrer\": \"email\"}','active','203.0.113.156','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36','2026-02-11 12:34:04',NULL,'2026-02-11 13:04:04'),('550e8400-e29b-41d4-a716-446655440008',2,5,'Marketing Campaign Planning','[6]','{\"device\": \"desktop\", \"browser\": \"safari\", \"referrer\": \"bookmark\"}','ended','10.0.0.51','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','2026-02-09 13:19:04',NULL,'2026-02-10 13:19:04'),('7b807c97-4d2f-48c2-966c-12619151a68e',10,24,'Chat 2026-02-11 14:59','null',NULL,'active',NULL,NULL,'2026-02-11 14:59:16',NULL,'2026-02-11 14:59:16'),('918832d0-9197-490d-9670-761debb20134',1,NULL,'Public Chat 2026-02-15 16:40',NULL,'{\"metadata\": null, \"visitorId\": \"test-visitor\", \"visitorName\": null, \"sessionToken\": \"sess_1e439eebfdc961c9ecb9aeaed49d4f27b68e232d53586395\", \"visitorEmail\": null}','active','127.0.0.1','python-requests/2.32.3','2026-02-15 16:40:46',NULL,'2026-02-15 16:40:46'),('9f4c1892-c0ea-4d88-8f43-087ad2d91b2c',1,NULL,'Public Chat 2026-02-11 16:22',NULL,'{\"metadata\": null, \"visitorName\": \"Visitor EP\", \"sessionToken\": \"tmo5p1WhBveE_utwrq-t6_RH_J6HNXqPcmB4afs_TpI\", \"visitorEmail\": \"visitor_ep2@test.com\"}','ended','127.0.0.1','python-httpx/0.28.1','2026-02-11 16:22:27','2026-02-11 16:22:33','2026-02-11 16:22:33'),('ad106ef9-68fd-467b-a385-17cf97454026',1,NULL,'Public Chat 2026-02-15 15:52',NULL,'{\"metadata\": null, \"visitorId\": \"visitor_44bf2a7d5d1898ad31d0cd88\", \"visitorName\": null, \"sessionToken\": \"sess_e38e9896d9680a249cfbe39e683f1f2752a0e5032602877c\", \"visitorEmail\": null}','active','127.0.0.1','python-requests/2.32.5','2026-02-15 15:52:33',NULL,'2026-02-15 15:52:33'),('bbad8fd6-3fae-4405-8c8b-aea5d6f3c5f6',1,NULL,'Public Chat 2026-02-15 16:26',NULL,'{\"metadata\": null, \"visitorId\": \"test-visitor\", \"visitorName\": null, \"sessionToken\": \"sess_76b6dadb57b72a97c6d6dee3fbc6cbf3877ee2ea3afc4ad9\", \"visitorEmail\": null}','active','127.0.0.1','python-requests/2.32.5','2026-02-15 16:26:56',NULL,'2026-02-15 16:26:56'),('c0cf32ca-2903-40d4-aa89-2bf8d8d0c5f1',1,NULL,'Public Chat 2026-02-15 15:43',NULL,'{\"metadata\": null, \"visitorId\": \"visitor_55ff9996ed4d7bc16d6f32f4\", \"visitorName\": null, \"sessionToken\": \"sess_e485860de36330041d5e9f973871c1b91802a9fd4d4fb330\", \"visitorEmail\": null}','active','127.0.0.1','python-requests/2.32.5','2026-02-15 15:43:34',NULL,'2026-02-15 15:43:34'),('d260c76f-be9e-4517-87aa-a2d1bd1d088a',1,NULL,'Public Chat 2026-02-11 16:27',NULL,'{\"metadata\": null, \"visitorName\": \"Visitor EP\", \"sessionToken\": \"QpQfub9tmCOvGKpGkjUV2x92qlEEuKGmaUs8-Qv1JkY\", \"visitorEmail\": \"visitor_1770827055@test.com\"}','ended','127.0.0.1','python-httpx/0.28.1','2026-02-11 16:27:35','2026-02-11 16:27:44','2026-02-11 16:27:43'),('e0321547-0822-49d0-99f5-bcfa65490b0c',1,NULL,'Public Chat 2026-02-11 13:36',NULL,'{\"metadata\": null, \"visitorName\": \"John Visitor\", \"sessionToken\": \"ALdXELt9qZOtGyjy9jCYiKa-V6JhtF2CsU94SMrCKd8\", \"visitorEmail\": null}','ended','127.0.0.1','curl/8.12.1','2026-02-11 13:36:35','2026-02-11 13:36:52','2026-02-11 13:36:51'),('f03aa453-76aa-4cf7-a2a7-ac824c8c0b6c',1,NULL,'Public Chat 2026-02-15 16:16',NULL,'{\"metadata\": null, \"visitorId\": \"test-visitor\", \"visitorName\": null, \"sessionToken\": \"sess_22cce7f285c01e0600f3cef0ae6efaf852571740fbe4e63d\", \"visitorEmail\": null}','active','127.0.0.1','python-requests/2.32.5','2026-02-15 16:16:23',NULL,'2026-02-15 16:16:23');
/*!40000 ALTER TABLE `chat_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_categories`
--

DROP TABLE IF EXISTS `document_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `parent_id` int DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category_tenant` (`tenant_id`),
  KEY `idx_category_parent` (`parent_id`),
  CONSTRAINT `document_categories_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_categories_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `document_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_categories`
--

LOCK TABLES `document_categories` WRITE;
/*!40000 ALTER TABLE `document_categories` DISABLE KEYS */;
INSERT INTO `document_categories` VALUES (1,1,'Updated Category','Technical product manuals and guides',NULL,1,'active','2026-02-11 13:19:04','2026-02-15 15:22:08'),(2,1,'User Guides','End-user documentation',1,1,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(3,1,'API Documentation','Developer API references',1,2,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(4,1,'HR Policies','Human resources policies and procedures',NULL,2,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(5,1,'Training Materials','Employee training resources',NULL,3,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(6,2,'Business Plans','Strategic business documentation',NULL,1,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(7,2,'Marketing','Marketing materials and campaigns',NULL,2,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(8,2,'Financial Reports','Financial planning and reports',NULL,3,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(9,3,'Operations','Daily operations procedures',NULL,1,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(10,3,'Customer Service','Customer service guidelines',NULL,2,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(11,3,'Inventory Management','Stock and inventory procedures',NULL,3,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(12,6,'Enterprise Policies','Company-wide policies and procedures',NULL,1,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(13,6,'Technical Specifications','Technical documentation and specs',NULL,2,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(14,6,'Compliance','Regulatory and compliance documentation',NULL,3,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(15,7,'Product Manuals','Product documentation and manuals',NULL,1,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(16,7,'Support Guides','Customer support documentation',NULL,2,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(17,8,'Program Guidelines','Program management guidelines',NULL,1,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(18,8,'Volunteer Resources','Resources for volunteers',NULL,2,'active','2026-02-11 13:19:04','2026-02-11 13:19:04'),(19,1,'Test Category','Testing category creation',NULL,0,'active','2026-02-11 13:35:18','2026-02-11 13:35:18');
/*!40000 ALTER TABLE `document_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_chunks`
--

DROP TABLE IF EXISTS `document_chunks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_chunks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `chunk_index` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_count` int DEFAULT NULL,
  `weaviate_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `embedding_status` enum('pending','processing','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chunk_document` (`document_id`),
  KEY `idx_chunk_tenant` (`tenant_id`),
  KEY `idx_chunk_weaviate` (`weaviate_id`),
  KEY `idx_chunk_status` (`embedding_status`),
  CONSTRAINT `document_chunks_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_chunks_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_chunks`
--

LOCK TABLES `document_chunks` WRITE;
/*!40000 ALTER TABLE `document_chunks` DISABLE KEYS */;
INSERT INTO `document_chunks` VALUES (4,2,1,0,'API Overview: Our RESTful API provides programmatic access to all core features of our platform. Authentication is required for all API calls using JWT tokens. The API follows standard HTTP methods and returns JSON responses.','chunk_hash_004',37,'weaviate_id_004','completed','{\"page\": 1, \"chapter\": \"introduction\", \"section\": \"overview\"}','2026-02-11 13:19:04','2026-02-11 13:19:04'),(5,2,1,1,'Authentication: To authenticate with our API, you must include a valid JWT token in the Authorization header of each request. Tokens can be obtained by making a POST request to /api/auth/login with valid credentials.','chunk_hash_005',40,'weaviate_id_005','completed','{\"page\": 2, \"chapter\": \"jwt-tokens\", \"section\": \"authentication\"}','2026-02-11 13:19:04','2026-02-11 13:19:04'),(6,5,2,0,'Executive Summary: This business plan outlines our strategy for aggressive growth in 2024. We project 300% revenue growth through strategic market expansion, innovative product launches, and enhanced customer acquisition strategies.','chunk_hash_006',34,'weaviate_id_006','completed','{\"page\": 1, \"chapter\": \"overview\", \"section\": \"executive-summary\"}','2026-02-11 13:19:04','2026-02-11 13:19:04'),(7,5,2,1,'Market Analysis: Our target market shows strong demand for AI-powered solutions. The total addressable market is estimated at $50 billion, with our serviceable addressable market representing $5 billion opportunity.','chunk_hash_007',33,'weaviate_id_007','completed','{\"page\": 5, \"chapter\": \"opportunity\", \"section\": \"market-analysis\"}','2026-02-11 13:19:04','2026-02-11 13:19:04'),(8,8,3,0,'Daily Operations Checklist: Start each day by reviewing the task queue, checking inventory levels, and ensuring all systems are operational. This systematic approach helps maintain consistent service quality and operational efficiency.','chunk_hash_008',35,'weaviate_id_008','completed','{\"page\": 1, \"chapter\": \"morning-routine\", \"section\": \"daily-checklist\"}','2026-02-11 13:19:04','2026-02-11 13:19:04'),(9,8,3,1,'Customer Interaction Guidelines: Always greet customers warmly, listen actively to their needs, and provide solutions that exceed their expectations. Follow up on all interactions to ensure satisfaction and build long-term relationships.','chunk_hash_009',36,'weaviate_id_009','completed','{\"page\": 15, \"chapter\": \"interactions\", \"section\": \"customer-service\"}','2026-02-11 13:19:04','2026-02-11 13:19:04'),(10,11,6,0,'Security Framework: Our enterprise security framework is built on zero-trust principles, implementing multi-layered security controls across all systems and data. This comprehensive approach ensures robust protection against evolving threats.','chunk_hash_010',35,'weaviate_id_010','completed','{\"page\": 1, \"chapter\": \"overview\", \"section\": \"framework\"}','2026-02-11 13:19:04','2026-02-11 13:19:04'),(11,11,6,1,'Access Control: All system access must be authenticated and authorized through our centralized identity management system. Role-based access controls ensure users have appropriate permissions for their responsibilities.','chunk_hash_011',32,'weaviate_id_011','completed','{\"page\": 8, \"chapter\": \"rbac\", \"section\": \"access-control\"}','2026-02-11 13:19:04','2026-02-11 13:19:04');
/*!40000 ALTER TABLE `document_chunks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_versions`
--

DROP TABLE IF EXISTS `document_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `version_number` int NOT NULL,
  `uploaded_by` int NOT NULL,
  `stored_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `change_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_document_version` (`document_id`,`version_number`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `document_versions_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `document_versions_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_versions`
--

LOCK TABLES `document_versions` WRITE;
/*!40000 ALTER TABLE `document_versions` DISABLE KEYS */;
INSERT INTO `document_versions` VALUES (1,1,1,1,'doc_1a2b3c_user-manual-v1.pdf','/uploads/tenant_1/versions/doc_1a2b3c_user-manual-v1.pdf',1948576,'Initial version','2026-02-11 13:19:04'),(2,1,2,1,'doc_1a2b3c_user-manual-v2.pdf','/uploads/tenant_1/doc_1a2b3c_user-manual-v2.pdf',2048576,'Updated with new features and bug fixes','2026-02-11 13:19:04'),(3,2,1,1,'doc_2b3c4d_api-reference-v1.pdf','/uploads/tenant_1/versions/doc_2b3c4d_api-reference-v1.pdf',1436000,'Initial API documentation','2026-02-11 13:19:04'),(4,5,1,5,'doc_5e6f7g_business-plan-v1.pdf','/uploads/tenant_2/versions/doc_5e6f7g_business-plan-v1.pdf',3896000,'Draft business plan','2026-02-11 13:19:04'),(5,11,1,13,'doc_11k2l3m_security-policy-v1.pdf','/uploads/tenant_6/versions/doc_11k2l3m_security-policy-v1.pdf',3384000,'Initial security policy draft','2026-02-11 13:19:04');
/*!40000 ALTER TABLE `document_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `original_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `tags` text COLLATE utf8mb4_unicode_ci,
  `status` enum('uploading','processing','processed','failed','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'uploading',
  `processing_status` enum('pending','in_progress','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `chunk_count` int DEFAULT '0',
  `embedding_count` int DEFAULT '0',
  `version` int DEFAULT '1',
  `is_public` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_document_tenant` (`tenant_id`),
  KEY `idx_document_status` (`status`),
  KEY `idx_document_hash` (`file_hash`),
  KEY `idx_document_category` (`category_id`),
  KEY `idx_documents_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `document_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,2,1,'user-manual-v2.pdf','doc_1a2b3c_user-manual-v2.pdf','/uploads/tenant_1/doc_1a2b3c_user-manual-v2.pdf',2048576,'application/pdf','sha256_hash_1a2b3c4d','Updated Title','test','[\"user-guide\", \"manual\", \"v2.0\"]','failed','failed','no such file: \'/uploads/tenant_1/doc_1a2b3c_user-manual-v2.pdf\'',45,45,1,0,'2026-02-11 13:19:04','2026-02-15 16:39:10'),(2,1,3,1,'api-reference.pdf','doc_2b3c4d_api-reference.pdf','/uploads/tenant_1/doc_2b3c4d_api-reference.pdf',1536000,'application/pdf','sha256_hash_2b3c4d5e','API Reference Guide','Complete API documentation for developers','[\"api\", \"documentation\", \"reference\"]','processed','completed',NULL,32,32,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(3,1,4,2,'employee-handbook.pdf','doc_3c4d5e_employee-handbook.pdf','/uploads/tenant_1/doc_3c4d5e_employee-handbook.pdf',3072000,'application/pdf','sha256_hash_3c4d5e6f','Employee Handbook 2024','HR policies and employee guidelines','[\"hr\", \"handbook\", \"policies\"]','processed','completed',NULL,67,67,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(4,1,5,3,'training-module-1.pdf','doc_4d5e6f_training-module-1.pdf','/uploads/tenant_1/doc_4d5e6f_training-module-1.pdf',1792000,'application/pdf','sha256_hash_4d5e6f7g','Training Module 1: Basics','Basic training for new employees','[\"training\", \"basics\", \"onboarding\"]','processed','completed',NULL,28,28,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(5,2,6,5,'business-plan-2024.pdf','doc_5e6f7g_business-plan-2024.pdf','/uploads/tenant_2/doc_5e6f7g_business-plan-2024.pdf',4096000,'application/pdf','sha256_hash_5e6f7g8h','Business Plan 2024','Strategic business plan for 2024','[\"business-plan\", \"strategy\", \"2024\"]','processed','completed',NULL,89,89,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(6,2,7,6,'marketing-strategy.pdf','doc_6f7g8h_marketing-strategy.pdf','/uploads/tenant_2/doc_6f7g8h_marketing-strategy.pdf',1792000,'application/pdf','sha256_hash_6f7g8h9i','Marketing Strategy Q1','Q1 marketing campaign strategy','[\"marketing\", \"strategy\", \"q1\"]','processed','completed',NULL,38,38,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(7,2,8,5,'financial-projections.pdf','doc_7g8h9i_financial-projections.pdf','/uploads/tenant_2/doc_7g8h9i_financial-projections.pdf',2304000,'application/pdf','sha256_hash_7g8h9i0j','Financial Projections 2024-2026','Three-year financial forecasting','[\"finance\", \"projections\", \"forecast\"]','processed','completed',NULL,52,52,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(8,3,9,8,'operations-manual.pdf','doc_8h9i0j_operations-manual.pdf','/uploads/tenant_3/doc_8h9i0j_operations-manual.pdf',2560000,'application/pdf','sha256_hash_8h9i0j1k','Operations Manual','Daily operations procedures and guidelines','[\"operations\", \"manual\", \"procedures\"]','processed','completed',NULL,56,56,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(9,3,10,9,'customer-service-guide.pdf','doc_9i0j1k_customer-service-guide.pdf','/uploads/tenant_3/doc_9i0j1k_customer-service-guide.pdf',1280000,'application/pdf','sha256_hash_9i0j1k2l','Customer Service Excellence','Guidelines for exceptional customer service','[\"customer-service\", \"guidelines\", \"excellence\"]','processed','completed',NULL,34,34,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(10,3,11,10,'inventory-procedures.pdf','doc_10j1k2l_inventory-procedures.pdf','/uploads/tenant_3/doc_10j1k2l_inventory-procedures.pdf',1536000,'application/pdf','sha256_hash_10j1k2l3m','Inventory Management Procedures','Stock management and inventory tracking','[\"inventory\", \"management\", \"tracking\"]','processed','completed',NULL,41,41,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(11,6,12,13,'enterprise-security-policy.pdf','doc_11k2l3m_enterprise-security-policy.pdf','/uploads/tenant_6/doc_11k2l3m_enterprise-security-policy.pdf',3584000,'application/pdf','sha256_hash_11k2l3m4n','Enterprise Security Policy','Comprehensive security policies and procedures','[\"security\", \"policy\", \"enterprise\"]','processed','completed',NULL,78,78,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(12,6,13,14,'technical-architecture.pdf','doc_12l3m4n_technical-architecture.pdf','/uploads/tenant_6/doc_12l3m4n_technical-architecture.pdf',4608000,'application/pdf','sha256_hash_12l3m4n5o','Technical Architecture Guide','System architecture and technical specifications','[\"architecture\", \"technical\", \"specifications\"]','processed','completed',NULL,95,95,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(13,7,15,16,'product-specifications.pdf','doc_13m4n5o_product-specifications.pdf','/uploads/tenant_7/doc_13m4n5o_product-specifications.pdf',2816000,'application/pdf','sha256_hash_13m4n5o6p','Product Specifications v3.2','Detailed product specifications and features','[\"product\", \"specifications\", \"features\"]','processed','completed',NULL,63,63,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(14,8,17,18,'program-guidelines.pdf','doc_14n5o6p_program-guidelines.pdf','/uploads/tenant_8/doc_14n5o6p_program-guidelines.pdf',1920000,'application/pdf','sha256_hash_14n5o6p7q','Community Program Guidelines','Guidelines for community outreach programs','[\"program\", \"guidelines\", \"community\"]','processed','completed',NULL,47,47,1,0,'2026-02-11 13:19:04','2026-02-11 13:19:04');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `subscription_id` int DEFAULT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('draft','sent','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `amount_due` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `stripe_invoice_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `subscription_id` (`subscription_id`),
  KEY `idx_invoice_tenant` (`tenant_id`),
  KEY `idx_invoice_status` (`status`),
  KEY `idx_invoice_number` (`invoice_number`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,1,1,'INV-2024-001','paid',2999.00,2999.00,'USD','in_1abc123invoice','2026-01-12','2026-01-13 13:19:04','2026-02-11 13:19:04'),(2,1,1,'INV-2024-015','paid',2999.00,2999.00,'USD','in_15abc456invoice','2027-01-12',NULL,'2026-02-11 13:19:04'),(3,2,2,'INV-2024-002','paid',99.00,99.00,'USD','in_2def456invoice','2026-01-27','2026-01-28 13:19:04','2026-02-11 13:19:04'),(4,2,2,'INV-2024-003','sent',99.00,0.00,'USD','in_3ghi789invoice','2026-02-26',NULL,'2026-02-11 13:19:04'),(5,3,3,'INV-2024-004','paid',29.00,29.00,'USD','in_4jkl012invoice','2026-02-01','2026-02-02 13:19:04','2026-02-11 13:19:04'),(6,3,3,'INV-2024-005','overdue',29.00,0.00,'USD','in_5mno345invoice','2026-02-06',NULL,'2026-02-11 13:19:04'),(7,6,6,'INV-2024-006','paid',4999.00,4999.00,'USD','in_6pqr678invoice','2025-12-28','2025-12-29 13:19:04','2026-02-11 13:19:04'),(8,6,6,'INV-2024-016','draft',4999.00,0.00,'USD','in_16def789invoice','2026-12-28',NULL,'2026-02-11 13:19:04'),(9,7,7,'INV-2024-007','paid',149.00,149.00,'USD','in_7stu901invoice','2026-01-22','2026-01-23 13:19:04','2026-02-11 13:19:04'),(10,7,7,'INV-2024-008','sent',149.00,0.00,'USD','in_8vwx234invoice','2026-02-21',NULL,'2026-02-11 13:19:04'),(11,8,8,'INV-2024-009','paid',199.00,199.00,'USD','in_9yza567invoice','2025-12-13','2025-12-14 13:19:04','2026-02-11 13:19:04'),(12,8,8,'INV-2024-017','draft',199.00,0.00,'USD','in_17ghi012invoice','2026-12-13',NULL,'2026-02-11 13:19:04');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `type` enum('info','warning','error','success') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `is_system` tinyint(1) DEFAULT '0',
  `priority` enum('low','normal','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notification_tenant` (`tenant_id`),
  KEY `idx_notification_user` (`user_id`),
  KEY `idx_notification_read` (`is_read`),
  KEY `idx_notification_created` (`created_at`),
  KEY `idx_notifications_user_read` (`user_id`,`is_read`,`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,1,'info','New Document Processed','Your uploaded document \"API Reference Guide\" has been successfully processed and is now available for chat queries.','/documents/2',1,1,'normal','2026-02-18 13:19:04','2026-02-11 13:19:04','2026-02-11 13:43:04'),(2,1,NULL,'success','Monthly Limit Reset','Your monthly API usage limits have been reset. You now have full access to all features for the new billing period.',NULL,0,1,'low','2026-03-13 13:19:04','2026-02-11 13:19:04',NULL),(3,1,2,'warning','Storage Almost Full','You are using 90% of your storage quota. Consider upgrading your plan or removing old documents to free up space.','/settings/billing',0,1,'high','2026-02-14 13:19:04','2026-02-11 13:19:04',NULL),(4,1,3,'info','Feature Update','We have released new chat analytics features. Check out the enhanced reporting dashboard for detailed insights.','/analytics',0,0,'normal','2026-02-25 13:19:04','2026-02-11 13:19:04',NULL),(5,2,5,'success','Welcome to Pro Plan','Congratulations! Your account has been upgraded to the Pro plan. Enjoy increased limits and advanced features.','/dashboard',1,0,'normal','2026-02-25 13:19:04','2026-02-11 13:19:04',NULL),(6,2,NULL,'info','System Maintenance','Scheduled maintenance will occur tonight from 2-4 AM EST. Some features may be temporarily unavailable.',NULL,0,1,'normal','2026-02-12 13:19:04','2026-02-11 13:19:04',NULL),(7,2,6,'success','Document Upload Complete','Your business plan document has been processed and indexed. It is now available for AI chat queries.','/documents/5',1,1,'normal','2026-02-16 13:19:04','2026-02-11 13:19:04',NULL),(8,3,8,'error','Payment Failed','Your recent payment attempt failed. Please update your payment method to continue using our services without interruption.','/settings/billing',0,1,'urgent','2026-02-13 13:19:04','2026-02-11 13:19:04',NULL),(9,3,9,'info','New Feature Available','We have added new analytics features to your dashboard. Check them out to get insights into your chat performance.','/analytics',0,0,'low','2026-02-21 13:19:04','2026-02-11 13:19:04',NULL),(10,3,10,'warning','Session Limit Approaching','You have used 85% of your monthly chat session limit. Consider upgrading to avoid service interruption.','/settings/billing',0,1,'normal','2026-02-16 13:19:04','2026-02-11 13:19:04',NULL),(11,4,11,'info','Welcome to Free Tier','Welcome to our platform! You are currently on the free tier. Explore our features and upgrade when ready.','/pricing',1,1,'low','2026-03-13 13:19:04','2026-02-11 13:19:04',NULL),(12,4,12,'warning','Usage Limit Reached','You have reached your daily chat limit. Upgrade to Pro for unlimited conversations.','/pricing',0,1,'normal','2026-02-12 13:19:04','2026-02-11 13:19:04',NULL),(13,6,13,'info','Security Audit Complete','Your quarterly security audit has been completed. All systems are compliant with enterprise security standards.','/security/audit',1,1,'normal','2026-05-12 13:19:04','2026-02-11 13:19:04',NULL),(14,6,14,'success','Backup Successful','Daily backup completed successfully. All data is securely backed up and encrypted.',NULL,1,1,'low','2026-02-12 13:19:04','2026-02-11 13:19:04',NULL),(15,6,15,'warning','High API Usage','Your API usage is 95% of monthly limit. Monitor usage or consider upgrading your plan.','/analytics/api',0,1,'high','2026-02-18 13:19:04','2026-02-11 13:19:04',NULL),(16,7,16,'info','Monthly Report Available','Your monthly usage report is now available. Review your teams chat performance and insights.','/reports/monthly',0,1,'normal','2026-03-13 13:19:04','2026-02-11 13:19:04',NULL),(17,7,17,'success','Integration Complete','Slack integration has been successfully configured. Your team can now access chat features directly from Slack.','/integrations',1,0,'normal','2026-02-18 13:19:04','2026-02-11 13:19:04',NULL),(18,8,18,'info','Volunteer Training','New volunteer training materials have been uploaded. All volunteers should review the updated guidelines.','/documents/14',0,0,'normal','2026-03-04 13:19:04','2026-02-11 13:19:04',NULL),(19,8,19,'success','Grant Application','Great news! Your application for the technology grant has been approved. Funds will be available next month.',NULL,1,0,'high','2026-04-12 13:19:04','2026-02-11 13:19:04',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'users.create','Create new users','user_management','2026-02-11 13:19:04'),(2,'users.read','View user information','user_management','2026-02-11 13:19:04'),(3,'users.update','Update user information','user_management','2026-02-11 13:19:04'),(4,'users.delete','Delete users','user_management','2026-02-11 13:19:04'),(5,'documents.create','Upload documents','document_management','2026-02-11 13:19:04'),(6,'documents.read','View documents','document_management','2026-02-11 13:19:04'),(7,'documents.update','Update documents','document_management','2026-02-11 13:19:04'),(8,'documents.delete','Delete documents','document_management','2026-02-11 13:19:04'),(9,'chat.create','Start chat sessions','chat','2026-02-11 13:19:04'),(10,'chat.read','View chat history','chat','2026-02-11 13:19:04'),(11,'analytics.read','View analytics','analytics','2026-02-11 13:19:04'),(12,'settings.read','View tenant settings','settings','2026-02-11 13:19:04'),(13,'settings.update','Update tenant settings','settings','2026-02-11 13:19:04'),(14,'billing.read','View billing information','billing','2026-02-11 13:19:04'),(15,'billing.update','Update billing information','billing','2026-02-11 13:19:04'),(16,'admin.full','Full administrative access','admin','2026-02-11 13:19:04'),(17,'support.tickets','Manage support tickets','support','2026-02-11 13:19:04'),(18,'api.access','Access API endpoints','api','2026-02-11 13:19:04'),(19,'reports.generate','Generate reports','reports','2026-02-11 13:19:04'),(20,'system.monitor','Monitor system health','system','2026-02-11 13:19:04');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` enum('super_admin','tenant_admin','support','customer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (17,'super_admin',1),(19,'super_admin',2),(20,'super_admin',3),(18,'super_admin',4),(8,'super_admin',5),(10,'super_admin',6),(11,'super_admin',7),(9,'super_admin',8),(6,'super_admin',9),(7,'super_admin',10),(2,'super_admin',11),(13,'super_admin',12),(14,'super_admin',13),(4,'super_admin',14),(5,'super_admin',15),(1,'super_admin',16),(15,'super_admin',17),(3,'super_admin',18),(12,'super_admin',19),(16,'super_admin',20),(32,'tenant_admin',1),(33,'tenant_admin',2),(34,'tenant_admin',3),(35,'tenant_admin',4),(36,'tenant_admin',5),(37,'tenant_admin',6),(38,'tenant_admin',7),(39,'tenant_admin',8),(40,'tenant_admin',9),(41,'tenant_admin',10),(42,'tenant_admin',11),(43,'tenant_admin',12),(44,'tenant_admin',13),(45,'tenant_admin',14),(46,'tenant_admin',19),(51,'support',2),(49,'support',6),(47,'support',9),(48,'support',10),(50,'support',17),(56,'customer',6),(54,'customer',9),(55,'customer',10);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `plan_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','cancelled','expired','past_due') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `billing_cycle` enum('monthly','yearly') COLLATE utf8mb4_unicode_ci DEFAULT 'monthly',
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `stripe_subscription_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stripe_customer_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_period_start` timestamp NULL DEFAULT NULL,
  `current_period_end` timestamp NULL DEFAULT NULL,
  `trial_end` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subscription_tenant` (`tenant_id`),
  KEY `idx_subscription_status` (`status`),
  KEY `idx_subscription_stripe` (`stripe_subscription_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (1,1,'Enterprise','active','yearly',2999.00,'USD','sub_1abc123enterprise','cus_techcorp123','2026-01-12 13:19:04','2027-01-12 13:19:04',NULL,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(2,2,'Pro','active','monthly',99.00,'USD','sub_2def456pro','cus_startuphub456','2026-01-27 13:19:04','2026-02-26 13:19:04',NULL,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(3,3,'Basic','active','monthly',29.00,'USD','sub_3ghi789basic','cus_localbiz789','2026-02-01 13:19:04','2026-03-03 13:19:04',NULL,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(4,4,'Free','active','monthly',0.00,'USD',NULL,NULL,'2026-02-06 13:19:04','2026-03-08 13:19:04','2026-03-08 13:19:04',NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(5,5,'Basic','cancelled','monthly',29.00,'USD','sub_4jkl012cancelled','cus_suspended012','2025-12-13 13:19:04','2026-01-12 13:19:04',NULL,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(6,6,'Enterprise','active','yearly',4999.00,'USD','sub_5mno345enterprise','cus_globalent345','2025-12-28 13:19:04','2026-12-28 13:19:04',NULL,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(7,7,'Pro','active','monthly',149.00,'USD','sub_6pqr678pro','cus_mediumcorp678','2026-01-22 13:19:04','2026-02-21 13:19:04',NULL,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(8,8,'Basic','active','yearly',199.00,'USD','sub_7stu901basic','cus_nonprofit901','2025-12-13 13:19:04','2026-12-13 13:19:04',NULL,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_health_checks`
--

DROP TABLE IF EXISTS `system_health_checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_health_checks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('healthy','degraded','unhealthy') COLLATE utf8mb4_unicode_ci NOT NULL,
  `response_time_ms` int DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `checked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_health_service` (`service_name`),
  KEY `idx_health_status` (`status`),
  KEY `idx_health_checked` (`checked_at`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_health_checks`
--

LOCK TABLES `system_health_checks` WRITE;
/*!40000 ALTER TABLE `system_health_checks` DISABLE KEYS */;
INSERT INTO `system_health_checks` VALUES (1,'mysql_database','healthy',45,NULL,'{\"connections\": 12, \"max_connections\": 100, \"queries_per_second\": 156}','2026-02-11 13:14:04'),(2,'weaviate_vector_db','healthy',120,NULL,'{\"disk_usage\": \"15.7GB\", \"memory_usage\": \"2.1GB\", \"vectors_count\": 1247}','2026-02-11 13:14:04'),(3,'openai_api','healthy',890,NULL,'{\"model\": \"gpt-3.5-turbo\", \"rate_limit_reset\": 3600, \"rate_limit_remaining\": 4500}','2026-02-11 13:14:04'),(4,'redis_cache','healthy',12,NULL,'{\"hit_ratio\": 0.95, \"memory_usage\": \"256MB\", \"connected_clients\": 23}','2026-02-11 13:14:04'),(5,'file_storage','degraded',2300,'Slow response times detected','{\"io_wait\": \"15%\", \"disk_usage\": \"78%\", \"available_space\": \"2.2TB\"}','2026-02-11 13:14:04'),(6,'email_service','healthy',340,NULL,'{\"queue_size\": 23, \"sent_today\": 1567, \"delivery_rate\": 98.5}','2026-02-11 13:14:04'),(7,'nginx_load_balancer','healthy',8,NULL,'{\"error_rate\": 0.02, \"active_connections\": 234, \"requests_per_second\": 89}','2026-02-11 13:14:04'),(8,'elasticsearch_logs','healthy',156,NULL,'{\"indices\": 45, \"storage\": \"12.3GB\", \"documents\": 2456789}','2026-02-11 13:14:04'),(9,'mysql_database','healthy',52,NULL,'{\"connections\": 15, \"max_connections\": 100, \"queries_per_second\": 178}','2026-02-11 12:19:04'),(10,'weaviate_vector_db','healthy',134,NULL,'{\"disk_usage\": \"15.6GB\", \"memory_usage\": \"2.0GB\", \"vectors_count\": 1245}','2026-02-11 12:19:04'),(11,'openai_api','degraded',1520,'Rate limit approaching','{\"model\": \"gpt-3.5-turbo\", \"rate_limit_reset\": 1800, \"rate_limit_remaining\": 450}','2026-02-11 12:19:04'),(12,'redis_cache','healthy',15,NULL,'{\"hit_ratio\": 0.94, \"memory_usage\": \"248MB\", \"connected_clients\": 19}','2026-02-11 12:19:04'),(13,'file_storage','unhealthy',5600,'Disk I/O errors detected','{\"io_errors\": 12, \"disk_usage\": \"78%\", \"available_space\": \"2.2TB\"}','2026-02-11 12:19:04'),(14,'email_service','healthy',298,NULL,'{\"queue_size\": 18, \"sent_today\": 1234, \"delivery_rate\": 98.8}','2026-02-11 12:19:04');
/*!40000 ALTER TABLE `system_health_checks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_analytics`
--

DROP TABLE IF EXISTS `tenant_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `metric_date` date NOT NULL,
  `active_users` int DEFAULT '0',
  `new_users` int DEFAULT '0',
  `chat_sessions` int DEFAULT '0',
  `messages_sent` int DEFAULT '0',
  `messages_received` int DEFAULT '0',
  `documents_uploaded` int DEFAULT '0',
  `storage_used_mb` decimal(10,2) DEFAULT '0.00',
  `api_calls` int DEFAULT '0',
  `processing_time_avg_ms` int DEFAULT '0',
  `cost_estimate` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_date` (`tenant_id`,`metric_date`),
  KEY `idx_analytics_tenant` (`tenant_id`),
  KEY `idx_analytics_date` (`metric_date`),
  CONSTRAINT `tenant_analytics_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_analytics`
--

LOCK TABLES `tenant_analytics` WRITE;
/*!40000 ALTER TABLE `tenant_analytics` DISABLE KEYS */;
INSERT INTO `tenant_analytics` VALUES (1,1,'2026-02-04',25,3,45,156,156,2,150.50,312,1250,15.75,'2026-02-11 13:19:04'),(2,1,'2026-02-05',28,1,52,189,189,1,175.20,378,1180,18.90,'2026-02-11 13:19:04'),(3,1,'2026-02-06',32,2,61,234,234,0,175.20,468,1320,23.40,'2026-02-11 13:19:04'),(4,1,'2026-02-07',29,0,38,145,145,1,198.70,290,1150,14.50,'2026-02-11 13:19:04'),(5,1,'2026-02-08',31,1,47,178,178,3,245.30,356,1280,17.80,'2026-02-11 13:19:04'),(6,1,'2026-02-09',35,2,58,221,221,0,245.30,442,1190,22.10,'2026-02-11 13:19:04'),(7,1,'2026-02-10',33,0,41,167,167,1,267.80,334,1230,16.70,'2026-02-11 13:19:04'),(8,2,'2026-02-04',12,1,18,65,65,1,95.30,130,1680,13.00,'2026-02-11 13:19:04'),(9,2,'2026-02-05',15,2,23,89,89,0,95.30,178,1520,17.80,'2026-02-11 13:19:04'),(10,2,'2026-02-06',14,0,19,72,72,1,112.70,144,1590,14.40,'2026-02-11 13:19:04'),(11,2,'2026-02-07',16,1,25,98,98,0,112.70,196,1650,19.60,'2026-02-11 13:19:04'),(12,2,'2026-02-08',18,0,28,115,115,2,148.90,230,1720,23.00,'2026-02-11 13:19:04'),(13,2,'2026-02-09',17,1,24,94,94,0,148.90,188,1580,18.80,'2026-02-11 13:19:04'),(14,2,'2026-02-10',19,0,31,127,127,1,165.40,254,1640,25.40,'2026-02-11 13:19:04'),(15,3,'2026-02-04',5,0,8,24,24,0,45.20,48,1100,2.40,'2026-02-11 13:19:04'),(16,3,'2026-02-05',6,1,12,38,38,1,67.80,76,1080,3.80,'2026-02-11 13:19:04'),(17,3,'2026-02-06',7,0,15,47,47,0,67.80,94,1150,4.70,'2026-02-11 13:19:04'),(18,3,'2026-02-07',5,0,9,28,28,0,67.80,56,1120,2.80,'2026-02-11 13:19:04'),(19,3,'2026-02-08',8,1,18,56,56,1,89.10,112,1090,5.60,'2026-02-11 13:19:04'),(20,3,'2026-02-09',6,0,11,34,34,0,89.10,68,1110,3.40,'2026-02-11 13:19:04'),(21,3,'2026-02-10',7,0,14,43,43,0,89.10,86,1130,4.30,'2026-02-11 13:19:04'),(22,4,'2026-02-04',2,0,3,8,8,0,12.50,16,1200,0.80,'2026-02-11 13:19:04'),(23,4,'2026-02-05',3,1,5,14,14,0,12.50,28,1150,1.40,'2026-02-11 13:19:04'),(24,4,'2026-02-06',2,0,4,12,12,0,12.50,24,1180,1.20,'2026-02-11 13:19:04'),(25,4,'2026-02-07',4,1,6,18,18,0,12.50,36,1220,1.80,'2026-02-11 13:19:04'),(26,4,'2026-02-08',3,0,4,11,11,0,12.50,22,1190,1.10,'2026-02-11 13:19:04'),(27,4,'2026-02-09',2,0,3,9,9,0,12.50,18,1160,0.90,'2026-02-11 13:19:04'),(28,4,'2026-02-10',3,0,5,15,15,0,12.50,30,1200,1.50,'2026-02-11 13:19:04'),(29,6,'2026-02-04',89,5,156,567,567,8,1245.70,1134,1580,113.40,'2026-02-11 13:19:04'),(30,6,'2026-02-05',92,3,178,645,645,6,1378.20,1290,1520,129.00,'2026-02-11 13:19:04'),(31,6,'2026-02-06',95,4,189,689,689,9,1567.80,1378,1610,137.80,'2026-02-11 13:19:04'),(32,6,'2026-02-07',88,2,167,598,598,5,1645.30,1196,1550,119.60,'2026-02-11 13:19:04'),(33,6,'2026-02-08',94,6,201,734,734,12,1832.90,1468,1620,146.80,'2026-02-11 13:19:04'),(34,6,'2026-02-09',97,3,215,789,789,7,1945.60,1578,1590,157.80,'2026-02-11 13:19:04'),(35,6,'2026-02-10',91,1,198,723,723,4,2012.40,1446,1600,144.60,'2026-02-11 13:19:04'),(36,7,'2026-02-04',34,2,45,167,167,3,287.90,334,1420,33.40,'2026-02-11 13:19:04'),(37,7,'2026-02-05',38,4,52,189,189,2,323.40,378,1380,37.80,'2026-02-11 13:19:04'),(38,7,'2026-02-06',35,1,48,175,175,1,345.70,350,1450,35.00,'2026-02-11 13:19:04'),(39,7,'2026-02-07',41,3,58,203,203,4,398.20,406,1390,40.60,'2026-02-11 13:19:04'),(40,7,'2026-02-08',39,0,54,198,198,2,434.80,396,1410,39.60,'2026-02-11 13:19:04'),(41,7,'2026-02-09',42,2,61,223,223,3,478.30,446,1370,44.60,'2026-02-11 13:19:04'),(42,7,'2026-02-10',40,1,56,207,207,1,501.70,414,1400,41.40,'2026-02-11 13:19:04'),(43,8,'2026-02-04',8,1,12,34,34,1,67.30,68,1250,3.40,'2026-02-11 13:19:04'),(44,8,'2026-02-05',9,0,15,42,42,0,67.30,84,1200,4.20,'2026-02-11 13:19:04'),(45,8,'2026-02-06',11,2,18,51,51,1,89.70,102,1280,5.10,'2026-02-11 13:19:04'),(46,8,'2026-02-07',7,0,11,31,31,0,89.70,62,1220,3.10,'2026-02-11 13:19:04'),(47,8,'2026-02-08',10,1,16,46,46,2,123.40,92,1260,4.60,'2026-02-11 13:19:04'),(48,8,'2026-02-09',9,0,14,39,39,0,123.40,78,1240,3.90,'2026-02-11 13:19:04'),(49,8,'2026-02-10',12,1,19,54,54,1,145.80,108,1270,5.40,'2026-02-11 13:19:04');
/*!40000 ALTER TABLE `tenant_analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_configurations`
--

DROP TABLE IF EXISTS `tenant_configurations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_configurations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `config_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text COLLATE utf8mb4_unicode_ci,
  `config_type` enum('string','integer','float','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_encrypted` tinyint(1) DEFAULT '0',
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_config` (`tenant_id`,`config_key`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_config_tenant` (`tenant_id`),
  CONSTRAINT `tenant_configurations_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_configurations_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_configurations`
--

LOCK TABLES `tenant_configurations` WRITE;
/*!40000 ALTER TABLE `tenant_configurations` DISABLE KEYS */;
INSERT INTO `tenant_configurations` VALUES (1,1,'openai_api_key','sk-encrypted-api-key-techcorp-xxxxx','string','OpenAI API key for AI services',1,1,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(2,1,'max_file_size_mb','50','integer','Maximum file upload size in MB',0,1,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(3,1,'enable_analytics','true','boolean','Enable analytics tracking',0,1,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(4,1,'chat_session_timeout','3600','integer','Chat session timeout in seconds',0,1,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(5,1,'welcome_message','Updated welcome message!','string','Default chat welcome message',0,1,'2026-02-11 13:19:04','2026-02-11 13:43:02'),(6,1,'max_context_chunks','10','integer','Maximum context chunks per response',0,1,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(7,1,'enable_feedback','true','boolean','Enable user feedback collection',0,1,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(8,2,'openai_api_key','sk-encrypted-api-key-startuphub-xxxxx','string','OpenAI API key for AI services',1,5,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(9,2,'max_file_size_mb','25','integer','Maximum file upload size in MB',0,5,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(10,2,'enable_analytics','true','boolean','Enable analytics tracking',0,5,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(11,2,'chat_theme','{\"primaryColor\": \"#059669\", \"accentColor\": \"#10b981\", \"fontFamily\": \"Inter\"}','json','Chat interface theme settings',0,5,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(12,2,'business_hours','{\"start\": \"08:00\", \"end\": \"18:00\", \"timezone\": \"EST\"}','json','Business operating hours',0,5,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(13,2,'enable_anonymous_chat','true','boolean','Allow anonymous chat sessions',0,5,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(14,3,'openai_api_key','sk-encrypted-api-key-localbiz-xxxxx','string','OpenAI API key for AI services',1,8,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(15,3,'max_file_size_mb','10','integer','Maximum file upload size in MB',0,8,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(16,3,'enable_analytics','false','boolean','Enable analytics tracking',0,8,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(17,3,'business_hours','{\"start\": \"09:00\", \"end\": \"17:00\", \"timezone\": \"PST\"}','json','Business operating hours',0,8,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(18,3,'welcome_message','Hello! Welcome to LocalBiz support. How may we assist you?','string','Default chat welcome message',0,8,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(19,4,'max_file_size_mb','5','integer','Maximum file upload size in MB',0,11,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(20,4,'enable_analytics','false','boolean','Enable analytics tracking',0,11,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(21,4,'chat_session_limit','10','integer','Maximum chat sessions per day',0,11,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(22,4,'welcome_message','Welcome to our demo! Try out our AI chatbot features.','string','Default chat welcome message',0,11,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(23,6,'openai_api_key','sk-encrypted-api-key-globalent-xxxxx','string','OpenAI API key for AI services',1,13,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(24,6,'max_file_size_mb','100','integer','Maximum file upload size in MB',0,13,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(25,6,'enable_analytics','true','boolean','Enable analytics tracking',0,13,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(26,6,'enable_audit_logging','true','boolean','Enable comprehensive audit logging',0,13,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(27,6,'security_level','enterprise','string','Security compliance level',0,13,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(28,6,'sso_enabled','true','boolean','Single Sign-On integration enabled',0,13,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(29,7,'openai_api_key','sk-encrypted-api-key-mediumcorp-xxxxx','string','OpenAI API key for AI services',1,16,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(30,7,'max_file_size_mb','30','integer','Maximum file upload size in MB',0,16,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(31,7,'enable_analytics','true','boolean','Enable analytics tracking',0,16,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(32,7,'chat_theme','{\"primaryColor\": \"#f59e0b\", \"accentColor\": \"#fbbf24\"}','json','Chat interface theme settings',0,16,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(33,8,'openai_api_key','sk-encrypted-api-key-nonprofit-xxxxx','string','OpenAI API key for AI services',1,18,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(34,8,'max_file_size_mb','15','integer','Maximum file upload size in MB',0,18,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(35,8,'enable_analytics','true','boolean','Enable analytics tracking',0,18,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(36,8,'volunteer_access','true','boolean','Allow volunteer access to chat system',0,18,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(37,1,'user_1_email_notifications','true','boolean',NULL,0,1,'2026-02-11 13:46:35','2026-02-11 13:46:35'),(38,1,'test_key','test_value','string',NULL,0,1,'2026-02-15 15:34:29','2026-02-15 15:34:29'),(39,1,'chatbotName','TestBot','string',NULL,0,1,'2026-02-15 16:17:03','2026-02-15 16:17:03'),(40,1,'welcomeMessage','Hello!','string',NULL,0,1,'2026-02-15 16:17:03','2026-02-15 16:17:03');
/*!40000 ALTER TABLE `tenant_configurations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#007bff',
  `secondary_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#6c757d',
  `custom_css` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `subscription_plan` enum('free','basic','pro','enterprise') COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `max_users` int DEFAULT '5',
  `max_chat_sessions` int DEFAULT '100',
  `max_storage_mb` int DEFAULT '500',
  `billing_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `domain` (`domain`),
  KEY `idx_tenant_slug` (`slug`),
  KEY `idx_tenant_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'TechCorp Solutions','techcorp','chat.techcorp.com','https://cdn.example.com/logos/techcorp.png','#1f2937','#3b82f6',NULL,'active','enterprise',100,10000,5000,'billing@techcorp.com','2026-02-11 13:19:04','2026-02-15 15:53:15'),(2,'StartupHub','startuphub','support.startuphub.io','https://cdn.example.com/logos/startuphub.png','#059669','#10b981',NULL,'active','pro',25,2500,2000,'finance@startuphub.io','2026-02-11 13:19:04','2026-02-11 13:19:04'),(3,'LocalBiz Inc','localbiz','help.localbiz.com','https://cdn.example.com/logos/localbiz.png','#dc2626','#ef4444',NULL,'active','basic',10,500,1000,'admin@localbiz.com','2026-02-11 13:19:04','2026-02-11 13:19:04'),(4,'FreeTier Demo','freetier',NULL,NULL,'#6366f1','#8b5cf6',NULL,'active','free',5,100,500,'demo@example.com','2026-02-11 13:19:04','2026-02-11 13:19:04'),(5,'Suspended Corp','suspended','old.suspended.com',NULL,'#374151','#6b7280',NULL,'suspended','basic',10,500,1000,'contact@suspended.com','2026-02-11 13:19:04','2026-02-11 13:19:04'),(6,'Global Enterprise','globalent','ai.globalenterprise.com','https://cdn.example.com/logos/global.png','#7c3aed','#a855f7',NULL,'active','enterprise',500,50000,10000,'billing@globalenterprise.com','2026-02-11 13:19:04','2026-02-11 13:19:04'),(7,'MediumCorp','mediumcorp','support.mediumcorp.com',NULL,'#f59e0b','#fbbf24',NULL,'active','pro',50,5000,3000,'accounts@mediumcorp.com','2026-02-11 13:19:04','2026-02-11 13:19:04'),(8,'NonProfit Org','nonprofit',NULL,NULL,'#10b981','#34d399',NULL,'active','basic',15,750,1500,'admin@nonprofit.org','2026-02-11 13:19:04','2026-02-11 13:19:04'),(9,'TestTenant','testtenant',NULL,NULL,'#007bff','#6c757d',NULL,'active','free',5,100,500,NULL,'2026-02-11 13:28:53','2026-02-11 13:28:53'),(10,'Default','default',NULL,NULL,'#007bff','#6c757d',NULL,'active','free',5,100,500,NULL,'2026-02-11 13:43:03','2026-02-11 13:43:03'),(11,'TestAdminTenant','testadmintenant',NULL,NULL,'#007bff','#6c757d',NULL,'active','free',5,100,500,NULL,'2026-02-11 15:42:46','2026-02-11 15:42:46'),(12,'Test Corp','test-corp-py3','test3.com',NULL,'#3B82F6','#10B981',NULL,'active','free',5,100,1000,'test@test.com','2026-02-15 15:33:52','2026-02-15 15:33:52'),(13,'Report Test Corp','report-test-corp',NULL,NULL,'#3B82F6','#10B981',NULL,'active','free',5,100,1000,'report@test.com','2026-02-15 15:41:33','2026-02-15 15:41:33'),(15,'Report Test Corp','test-corp-1771170401',NULL,NULL,'#3B82F6','#10B981',NULL,'active','free',5,100,1000,'report@test.com','2026-02-15 15:46:43','2026-02-15 15:46:43'),(16,'Report Test Corp','rpt-1771170787',NULL,NULL,'#3B82F6','#10B981',NULL,'active','free',5,100,1000,'rpt@test.com','2026-02-15 15:53:09','2026-02-15 15:53:09'),(17,'Compare Test 1771172188','cmp-1771172188',NULL,NULL,'#3B82F6','#10B981',NULL,'active','basic',5,100,1000,NULL,'2026-02-15 16:16:30','2026-02-15 16:16:30'),(18,'Spec Test 1771172722','spec-1771172722',NULL,NULL,'#3B82F6','#10B981',NULL,'active','free',5,100,1000,NULL,'2026-02-15 16:25:24','2026-02-15 16:25:24'),(19,'Spec Test 1771173551','spec-1771173551',NULL,NULL,'#3B82F6','#10B981',NULL,'active','free',5,100,1000,NULL,'2026-02-15 16:39:13','2026-02-15 16:39:13');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `idx_session_user` (`user_id`),
  KEY `idx_session_expires` (`expires_at`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_sessions_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES ('7d3bd0d4-be77-4a97-ae86-0ee256301cce',1,1,'::1','curl/8.12.1','2026-02-22 16:13:04','2026-02-15 16:13:04'),('c60ddb86-cc81-4f3f-93fc-39c3cd46cf1f',1,1,'::1','python-requests/2.32.5','2026-02-22 16:14:25','2026-02-15 16:14:25'),('sess_0a6f5066fd1242969902',31,10,'127.0.0.1','python-requests/2.32.3','2026-02-18 15:40:33','2026-02-11 15:40:33'),('sess_0bb42d2938cd40b2aa4f',1,1,'127.0.0.1','python-requests/2.32.3','2026-02-22 16:38:58','2026-02-15 16:38:58'),('sess_0ccbfd80422644a685f8',32,11,'127.0.0.1','python-requests/2.32.3','2026-02-18 15:42:49','2026-02-11 15:42:49'),('sess_0df2ca10094f424ba6b3',1,1,'127.0.0.1','curl/8.12.1','2026-02-18 13:41:32','2026-02-11 13:41:32'),('sess_0e485dddcca44d1ab715',1,1,'127.0.0.1','curl/8.12.1','2026-02-18 13:31:13','2026-02-11 13:31:13'),('sess_1a2b3c4d5e6f7g8h9i0j',1,1,'192.168.1.100','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','2026-02-12 13:19:04','2026-02-11 13:19:04'),('sess_1c5abb7a51124b6193f3',24,10,'127.0.0.1','python-requests/2.32.3','2026-02-18 14:41:43','2026-02-11 14:41:43'),('sess_25b6007ac89748de9d13',1,1,'127.0.0.1','python-httpx/0.28.1','2026-02-18 16:09:59','2026-02-11 16:09:59'),('sess_263e448f45ae44c7a44d',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:19:14','2026-02-15 15:19:14'),('sess_274d3b9ad1524fad98a7',1,1,'127.0.0.1','curl/8.12.1','2026-02-22 16:09:33','2026-02-15 16:09:32'),('sess_2b3c4d5e6f7g8h9i0j1k',5,2,'10.0.0.50','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','2026-02-12 13:19:04','2026-02-11 13:19:04'),('sess_3748333b3a974bd39721',1,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-23 07:44:15','2026-02-16 07:44:15'),('sess_3c4d5e6f7g8h9i0j1k2l',8,3,'172.16.0.25','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36','2026-02-12 13:19:04','2026-02-11 13:19:04'),('sess_3c57cfbdbc0e419da620',1,1,'127.0.0.1','curl/8.12.1','2026-02-22 16:37:02','2026-02-15 16:37:02'),('sess_48b0009b5f0b4e318ee9',1,1,'127.0.0.1','curl/8.12.1','2026-02-22 15:03:41','2026-02-15 15:03:41'),('sess_4d5e6f7g8h9i0j1k2l3m',11,4,'203.0.113.45','Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)','2026-02-12 13:19:04','2026-02-11 13:19:04'),('sess_514fef9cecbf44d98dba',1,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-18 18:56:00','2026-02-11 18:55:59'),('sess_5470fe7f585f446e9768',1,1,'127.0.0.1','python-httpx/0.28.1','2026-02-18 16:24:33','2026-02-11 16:24:33'),('sess_547ffdc66ba046e8a5d9',1,1,'127.0.0.1','python-httpx/0.28.1','2026-02-18 16:19:57','2026-02-11 16:19:57'),('sess_5be8d59c323b41e0bab1',28,10,'127.0.0.1','curl/8.16.0','2026-02-18 14:44:22','2026-02-11 14:44:22'),('sess_5e6f7g8h9i0j1k2l3m4n',13,6,'198.51.100.78','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','2026-02-12 13:19:04','2026-02-11 13:19:04'),('sess_6c787f80942c4072a6f5',1,1,'127.0.0.1','curl/8.12.1','2026-02-18 18:50:28','2026-02-11 18:50:27'),('sess_6d3e2a0a71ac47de8726',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 15:32:01','2026-02-15 15:32:01'),('sess_6f7g8h9i0j1k2l3m4n5o',16,7,'192.0.2.134','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36','2026-02-12 13:19:04','2026-02-11 13:19:04'),('sess_72b16cdf77d84534ba5f',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 15:33:48','2026-02-15 15:33:48'),('sess_75e7df49fd1b4f47ac61',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:11:16','2026-02-15 15:11:16'),('sess_7ada3eaecc5e447698f3',1,1,'127.0.0.1','curl/8.12.1','2026-02-23 07:41:59','2026-02-16 07:41:59'),('sess_857d488dea7d4d72a3be',1,1,'127.0.0.1','python-httpx/0.28.1','2026-02-18 16:14:47','2026-02-11 16:14:47'),('sess_872d2689d229493ebede',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:17:47','2026-02-15 15:17:47'),('sess_88cf3850ddc94954b2cd',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 15:43:05','2026-02-15 15:43:04'),('sess_8a9e7733dff44a589c5a',1,1,'127.0.0.1','curl/8.12.1','2026-02-18 14:39:20','2026-02-11 14:39:19'),('sess_8c61d9c1f085419fa043',32,11,'127.0.0.1','python-requests/2.32.3','2026-02-18 16:02:27','2026-02-11 16:02:26'),('sess_8e533c4e2ceb42709128',1,1,'127.0.0.1','curl/8.12.1','2026-02-22 16:11:03','2026-02-15 16:11:02'),('sess_8f62e00fb5854ed0b384',32,11,'127.0.0.1','python-requests/2.32.3','2026-02-18 16:01:25','2026-02-11 16:01:25'),('sess_9271fe0ad87b4e9bafa3',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:18:45','2026-02-15 15:18:45'),('sess_999fce2a4e594e638024',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:22:08','2026-02-15 15:22:07'),('sess_a0dd0656386543f9922d',24,10,'127.0.0.1','python-requests/2.32.3','2026-02-18 14:55:09','2026-02-11 14:55:09'),('sess_a4717eed9d724889a660',31,10,'127.0.0.1','python-requests/2.32.3','2026-02-18 15:40:57','2026-02-11 15:40:56'),('sess_aa3b655a627f4bd3bd7a',30,10,'127.0.0.1','curl/8.16.0','2026-02-18 15:18:33','2026-02-11 15:18:33'),('sess_ad3bd1ac33814ea7b267',27,10,'127.0.0.1','curl/8.12.1','2026-02-18 14:42:38','2026-02-11 14:42:37'),('sess_b20c4df74d3149268126',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 15:40:29','2026-02-15 15:40:29'),('sess_b34684bc0aa449169cb2',32,11,'127.0.0.1','python-requests/2.32.3','2026-02-18 16:00:39','2026-02-11 16:00:38'),('sess_b8b9d80c21ea41499c10',1,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-18 18:39:02','2026-02-11 18:39:02'),('sess_baadb16b77124b10a193',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:18:20','2026-02-15 15:18:20'),('sess_bc22042e86df482dbafc',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 16:14:28','2026-02-15 16:14:27'),('sess_c17c5eb4dae8408585f6',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 15:35:06','2026-02-15 15:35:06'),('sess_c3817f525b954c81b858',1,1,'127.0.0.1','curl/8.12.1','2026-02-22 15:30:27','2026-02-15 15:30:27'),('sess_cb58a183c99543378c08',24,10,'127.0.0.1','python-requests/2.32.3','2026-02-18 14:41:08','2026-02-11 14:41:07'),('sess_cc72170a74a947848934',1,1,'127.0.0.1','curl/8.12.1','2026-02-18 13:43:38','2026-02-11 13:43:38'),('sess_d4f3afd1a381492a86ed',32,11,'127.0.0.1','python-requests/2.32.3','2026-02-18 16:03:03','2026-02-11 16:03:03'),('sess_d55913e68961433fa2c3',1,1,'127.0.0.1','python-httpx/0.28.1','2026-02-18 16:07:40','2026-02-11 16:07:39'),('sess_d67af775fbad47a596d7',1,1,'127.0.0.1','curl/8.12.1','2026-02-22 16:11:45','2026-02-15 16:11:45'),('sess_d84aff06feab400ea83e',20,9,'127.0.0.1','curl/8.12.1','2026-02-18 13:29:02','2026-02-11 13:29:02'),('sess_dcaf51f6a0624343aba4',1,1,'127.0.0.1','curl/8.12.1','2026-02-22 16:11:36','2026-02-15 16:11:35'),('sess_dd97c7601cd94ff98816',1,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-18 18:55:28','2026-02-11 18:55:27'),('sess_ded5b7a698ea40508720',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 16:25:09','2026-02-15 16:25:09'),('sess_deedde6aa82946d1b53b',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:10:05','2026-02-15 15:10:04'),('sess_df8b1ebd4175480d8869',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:21:12','2026-02-15 15:21:12'),('sess_e09cdeb9c9594407ab9d',26,10,'127.0.0.1','python-requests/2.32.3','2026-02-18 14:42:03','2026-02-11 14:42:03'),('sess_e1d7dc7679b441f7a70d',1,1,'127.0.0.1','curl/8.12.1','2026-02-22 15:30:27','2026-02-15 15:30:26'),('sess_e466518a1ce34e81ad55',32,11,'127.0.0.1','python-requests/2.32.3','2026-02-18 16:01:41','2026-02-11 16:01:41'),('sess_e4c9a42277bb4e78a1b6',1,1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36','2026-02-18 16:53:30','2026-02-11 16:53:30'),('sess_e548e12a6c7d4692acc6',20,9,'127.0.0.1','curl/8.12.1','2026-02-18 13:49:09','2026-02-11 13:49:08'),('sess_f2b3dc9c966d4613b54a',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 15:52:05','2026-02-15 15:52:04'),('sess_f5873470d7d44ebd8a46',1,1,'127.0.0.1','python-requests/2.32.5','2026-02-22 15:45:39','2026-02-15 15:45:39'),('sess_f8384f054eed44d69530',1,1,'127.0.0.1','curl/8.16.0','2026-02-22 15:08:12','2026-02-15 15:08:11');
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('super_admin','tenant_admin','support','customer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive','pending','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `email_verified` tinyint(1) DEFAULT '0',
  `email_verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int DEFAULT '0',
  `locked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_email` (`tenant_id`,`email`),
  KEY `idx_user_email` (`email`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_status` (`status`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'admin@techcorp.com','$2b$12$dF.cplsyzYYKwkQ0aX7LxeO04P.c/y.RRDckMQZDnZN/9McHZH0Xe','Admin','User','super_admin','active',1,NULL,'Ap-bLvZRrUQRiQWSCNuZJXpPXhnvXzFUNxvv-QtzErM','2026-02-11 17:24:40','2026-02-16 07:44:16',0,NULL,'2026-02-11 13:19:04','2026-02-16 07:44:15'),(2,1,'support@techcorp.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Support','Agent','support','active',1,NULL,NULL,NULL,'2026-02-11 08:19:04',1,NULL,'2026-02-11 13:19:04','2026-02-15 16:16:38'),(3,1,'user1@techcorp.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Mike','Wilson','customer','active',1,NULL,NULL,NULL,'2026-02-10 13:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(4,1,'dev@techcorp.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Sarah','Developer','customer','active',1,NULL,NULL,NULL,'2026-02-11 10:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(5,2,'founder@startuphub.io','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Alex','Founder','tenant_admin','active',1,NULL,NULL,NULL,'2026-02-11 12:49:04',1,NULL,'2026-02-11 13:19:04','2026-02-11 14:42:46'),(6,2,'team@startuphub.io','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Lisa','Manager','customer','active',1,NULL,NULL,NULL,'2026-02-11 10:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(7,2,'marketing@startuphub.io','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','David','Marketing','customer','active',1,NULL,NULL,NULL,'2026-02-10 13:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(8,3,'owner@localbiz.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Robert','Garcia','tenant_admin','active',1,NULL,NULL,NULL,'2026-02-11 07:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(9,3,'staff@localbiz.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Maria','Martinez','support','active',1,NULL,NULL,NULL,'2026-02-09 13:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(10,3,'employee@localbiz.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Carlos','Rodriguez','customer','active',1,NULL,NULL,NULL,'2026-02-11 05:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(11,4,'demo@example.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Demo','User','tenant_admin','active',1,NULL,NULL,NULL,'2026-02-11 12:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(12,4,'test@example.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Test','Account','customer','active',1,NULL,NULL,NULL,'2026-02-11 09:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(13,6,'cto@globalenterprise.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Patricia','Tech','tenant_admin','active',1,NULL,NULL,NULL,'2026-02-11 12:34:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(14,6,'manager1@globalenterprise.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','James','Manager','support','active',1,NULL,NULL,NULL,'2026-02-11 11:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(15,6,'analyst@globalenterprise.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Emily','Analyst','customer','active',1,NULL,NULL,NULL,'2026-02-10 13:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(16,7,'admin@mediumcorp.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Thomas','Admin','tenant_admin','active',1,NULL,NULL,NULL,'2026-02-11 10:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(17,7,'support@mediumcorp.com','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Rachel','Support','support','active',1,NULL,NULL,NULL,'2026-02-11 08:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(18,8,'director@nonprofit.org','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Jennifer','Director','tenant_admin','active',1,NULL,NULL,NULL,'2026-02-11 09:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(19,8,'volunteer@nonprofit.org','$2b$12$LQv3c1yqBWVHuP8qXKNppe2C8Dt.FTsGPuHFgVmz7HcD8r9o2k3wG','Mark','Volunteer','customer','active',1,NULL,NULL,NULL,'2026-02-11 07:19:04',0,NULL,'2026-02-11 13:19:04','2026-02-11 13:19:04'),(20,9,'testuser@example.com','$2b$12$an4dBjCHu2pxipf9CNL10eDtM19lh.9Cz373Aw/691aVaKrJgB/7a','Test','User','tenant_admin','active',0,'xl5b2MQdkYf4JUbMNG6sr3Hab7C0_XG6HhWybo3ET8Q',NULL,NULL,'2026-02-11 13:49:09',0,NULL,'2026-02-11 13:28:53','2026-02-11 13:49:08'),(21,1,'newuser@techcorp.com','$2b$12$ZeqLKlrGPL/g72BvLDWQOuyaLlZz8GwD9Sjy1NwkYfSGJztxTBkvO',NULL,NULL,'customer','active',0,'qVRqjwt9gsvpB9HOYSw4dRPRiANLnNabdCB7F55_CA8',NULL,NULL,NULL,0,NULL,'2026-02-11 13:43:03','2026-02-11 13:43:03'),(22,10,'signup@test.com','$2b$12$IU.ozEqBNBVGr/YSD4G/wuT9YbBKbvLuWdf9e0eKqQ9eq1duRpADK','Signup','Test','tenant_admin','active',0,'Msf0NuKQA3U25wVAIzoq6aXtXFkwzMcINpUyc0WzcTs',NULL,NULL,NULL,0,NULL,'2026-02-11 13:46:37','2026-02-11 13:46:37'),(23,10,'testuser_round2@test.com','$2b$12$qsXyvGV7hcME51qMQcMnV.I72qioKhVhKAegc9VsLxWp04ZcJO2x.',NULL,NULL,'customer','active',0,'5doCoZrM8uS7pwk0hdOB_TQEuRInclu9VUFDGl75WLw',NULL,NULL,NULL,0,NULL,'2026-02-11 14:39:05','2026-02-11 14:39:05'),(24,10,'testuser_debug@test.com','$2b$12$KnoJzTbtw1UpTE3dKcCkhuw0h/pTcitycGKTuUhPircsDZn4iWtG6','Admin','User','super_admin','active',0,'jKmAgww-gMZAux5AzaTKxzOk-clCQCddR6ci-A0sHt0',NULL,NULL,'2026-02-11 14:55:10',0,NULL,'2026-02-11 14:40:58','2026-02-11 14:55:41'),(25,10,'signup_r2@test.com','$2b$12$Nn/gI28aQRbfmHGKnkafteAE60SqnJ4d/kpqiKD3brhk1wBTo/EC.','Signup','R2','customer','active',0,'SFUzhLxSkYpjoN1hD9pMBD789t25Zx_duAeaX_0hjY0',NULL,NULL,NULL,0,NULL,'2026-02-11 14:41:13','2026-02-11 14:41:13'),(26,10,'newadmin_test@techcorp.com','$2b$12$BLIuruNMzbWB05EjqXXwHOBH7nTvjhV3lMd0IeCCVpRy59hOXdr5K',NULL,NULL,'customer','active',0,'gqGCtTijx4fzrqPw1qsUxCg2hb_7aebYAWQCIX6Q1V8',NULL,NULL,'2026-02-11 14:42:03',0,NULL,'2026-02-11 14:42:00','2026-02-11 14:42:03'),(27,10,'testuser_round3@test.com','$2b$12$krLPymhWqaT4fsHGgaXcSeGYCR6kUWBhtAHmBX2NgArg/9w3ZjAdC',NULL,NULL,'customer','active',0,'WsjcVZ1jYC6ihKkhruhJXhJyuYMZ1vQOrXEkpsscQwc',NULL,NULL,'2026-02-11 14:42:38',0,NULL,'2026-02-11 14:42:30','2026-02-11 14:42:37'),(28,10,'endpoint_test_user@test.com','$2b$12$ItjXVg9zTcMz9N80ok4que7PsO38pIdGRQoCuymD6snNR2yiQf0wm',NULL,NULL,'customer','active',0,'QqBB5mr3oM3QWOrqahD6W2J2yNfriaNS84okERITa10',NULL,NULL,'2026-02-11 14:44:22',0,NULL,'2026-02-11 14:44:18','2026-02-11 14:44:22'),(29,10,'signup_1770821733@t.com','$2b$12$Q3X12/KoupgTLyZciEXbguskX3vAcIM6bTGr3lBpodGZVLDhGcXHS','S','R','customer','active',0,'3TRNXeAwX23HKewlVrTfcb4F88wKL6IJl-3wE05i8J0',NULL,NULL,NULL,0,NULL,'2026-02-11 14:55:50','2026-02-11 14:55:50'),(30,10,'ft6_user@test.com','$2b$12$1X4jc7lq5xw95ZXXC8CZf.fO3iBK1x2lS57iS9ss9W8UmKPWb36XG','Updated','Tester','customer','active',0,'H4UTtJbTBR6ML0_gsuvHUvbrKKe6HZBcsEMTvnYoMCg','erzz7crS9aSt78yPmmP6XiIgoo-xrE8Jm461EapTC_g','2026-02-11 16:18:32','2026-02-11 15:18:33',0,NULL,'2026-02-11 15:18:29','2026-02-11 15:18:36'),(31,10,'testuser_r2@example.com','$2b$12$ouBJRe2StBhjnT9aAYvxXu8c4c/zKSzF6NxMOJap4g/Hrk05Z85Uy',NULL,NULL,'customer','active',0,'TUzFHCH0DGYQfXcb9FX_bKSpUfAUPSTpOTJjLA9-9QI',NULL,NULL,'2026-02-11 15:40:57',0,NULL,'2026-02-11 15:40:22','2026-02-11 15:40:56'),(32,11,'admin_test_r2@example.com','$2b$12$L65IH/DjJi7WDzVTCbYfkue6Z.rpS.3hVkPMM7qHZBTpHDNvpzfKy','Admin','Tester','tenant_admin','active',0,'EksdPP7nNVC-vspaAziQzMtnFOBhCo2oSIB4brzMLrI',NULL,NULL,'2026-02-11 16:03:03',0,NULL,'2026-02-11 15:42:46','2026-02-11 16:03:03'),(33,11,'invite_r2@test.com','$2b$12$JIgNZgdLgdfIc8LeOsGuL.ffHtBxn.tw6igjEr0enYJ/32w2/53HC',NULL,NULL,'customer','active',0,'YzBZZDQBMRezS7hqiO4sKg2mE5VBWzTLlFgZ0wn41G4',NULL,NULL,NULL,0,NULL,'2026-02-11 16:03:45','2026-02-11 16:03:45'),(34,10,'endpointtest@test.com','$2b$12$lzg3saCA8LRxS3Rd/BiCTOMiklqPDtRaxJvqQIb8XFDM9cSglgqQi',NULL,NULL,'customer','active',0,'b_26_0f0AGCS6yJhVOxJ2RAGltb9clnlvVSYQb5jF7I',NULL,NULL,NULL,0,NULL,'2026-02-11 16:09:55','2026-02-11 16:09:55'),(35,1,'invite_ep@test.com','$2b$12$uQ1Z060qH.v4wkCRaoiNd.sEldJ8mG3dRwQJwmr0fOwOWmXSbs74q',NULL,NULL,'customer','active',0,'7Da6a2A2c35D5VbM4azQEXRyF-cAnUNJCtrTpEVEvnk',NULL,NULL,NULL,0,NULL,'2026-02-11 16:11:27','2026-02-11 16:11:28'),(36,10,'signup_ep@test.com','$2b$12$9wkcOp6pwG.7UndoqgpUlOGUWnG35Vx1GNxJukHrVAtnMTlg7gQ5G','Signup','EP','customer','active',0,'X_RL0XCdN8MSssj9CPDc6C3EF2nIBlyET0aMhQfOzmU',NULL,NULL,NULL,0,NULL,'2026-02-11 16:12:26','2026-02-11 16:12:26'),(37,10,'endpointtest2@test.com','$2b$12$wa17jmevYy8EwkLrgtdl7ukE.Q2gHDiiOPkBbN9.NNHEvXF/UvIp2',NULL,NULL,'customer','active',0,'AN_9jomEtae2d7OxLILhst1-Ndp51Ezpg13ASOmMNi8',NULL,NULL,NULL,0,NULL,'2026-02-11 16:14:41','2026-02-11 16:14:41'),(38,1,'invite_ep2@test.com','$2b$12$7v3uRbwFnyGMhD9TxfSOUOJFg/IJ.mwBA6nF15MIvxken0yp1OwTe',NULL,NULL,'customer','active',0,'0M4Y_Wv-wuhPtXaZIydHxeY2I7bdCpFmtmKR01lao2Y',NULL,NULL,NULL,0,NULL,'2026-02-11 16:16:19','2026-02-11 16:16:19'),(39,10,'signup_ep2@test.com','$2b$12$dKgrhvad6y/5PX/31.ghmOqHKMzspMHbJAA.oDwSxR4qpGRYe7Ycu','Signup','EP2','customer','active',0,'8G-9Pv-XKSMUkxoDbMC5YicmBeAoFVlIL_09FynBzwM',NULL,NULL,NULL,0,NULL,'2026-02-11 16:17:02','2026-02-11 16:17:02'),(40,10,'eptest_1770827055@test.com','$2b$12$hvv5XJeftEQ7WTrBx8sQmuw7tg.h7XuWbJSlRxdmd9f/EVnNKCQU2',NULL,NULL,'customer','active',0,'kJViy_fC5WpCdVFxoVkmCmlT8AL4gOHem75SX03ClZo',NULL,NULL,NULL,0,NULL,'2026-02-11 16:24:29','2026-02-11 16:24:29'),(41,1,'invite_1770827055@test.com','$2b$12$6tM.6a0zHkUWg29a/A5cCuoZTMPBD.VcyvTZuKnV5XXGrB4G1SjSe',NULL,NULL,'customer','active',0,'yKjDIvdubFyd7CKrzVmaXEYaOlvMfPlrdJ_NVK9bTHw',NULL,NULL,NULL,0,NULL,'2026-02-11 16:25:51','2026-02-11 16:25:51'),(42,10,'signup_1770827055@test.com','$2b$12$zqvJTnDIVgE3SU40FjRSROnX/0JZQcnxyeNLNccBnycT23fphDdzm','Signup','Test','customer','active',0,'hNdMUOE9xhSxdgLHOpi0iXA1IdD5ifEpNnquoYPEfBs',NULL,NULL,NULL,0,NULL,'2026-02-11 16:26:54','2026-02-11 16:26:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_tenant_summary`
--

DROP TABLE IF EXISTS `v_tenant_summary`;
/*!50001 DROP VIEW IF EXISTS `v_tenant_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_tenant_summary` AS SELECT 
 1 AS `id`,
 1 AS `name`,
 1 AS `slug`,
 1 AS `status`,
 1 AS `subscription_plan`,
 1 AS `user_count`,
 1 AS `document_count`,
 1 AS `active_sessions`,
 1 AS `storage_used_mb`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_tenant_summary`
--

/*!50001 DROP VIEW IF EXISTS `v_tenant_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_tenant_summary` AS select `t`.`id` AS `id`,`t`.`name` AS `name`,`t`.`slug` AS `slug`,`t`.`status` AS `status`,`t`.`subscription_plan` AS `subscription_plan`,count(distinct `u`.`id`) AS `user_count`,count(distinct `d`.`id`) AS `document_count`,count(distinct `cs`.`id`) AS `active_sessions`,(coalesce(sum(`d`.`file_size`),0) / (1024 * 1024)) AS `storage_used_mb`,`t`.`created_at` AS `created_at` from (((`tenants` `t` left join `users` `u` on(((`t`.`id` = `u`.`tenant_id`) and (`u`.`status` = 'active')))) left join `documents` `d` on(((`t`.`id` = `d`.`tenant_id`) and (`d`.`status` = 'processed')))) left join `chat_sessions` `cs` on(((`t`.`id` = `cs`.`tenant_id`) and (`cs`.`status` = 'active')))) where (`t`.`status` = 'active') group by `t`.`id`,`t`.`name`,`t`.`slug`,`t`.`status`,`t`.`subscription_plan`,`t`.`created_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-16 13:20:13
