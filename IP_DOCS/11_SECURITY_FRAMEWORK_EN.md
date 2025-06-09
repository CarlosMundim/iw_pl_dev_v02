# Chapter 11: Security Framework & Data Protection

**Document Version**: 1.0.0  
**Last Updated**: December 2024  
**Classification**: Confidential - IP Documentation  
**Target Markets**: 🇯🇵 Japan (Primary), 🇰🇷 South Korea, 🌏 ASEAN  

---

## 11.1 Security Architecture Overview

### Enterprise-Grade Security Framework

**Security Architecture Diagram**
```mermaid
graph TB
    subgraph "Edge Security Layer"
        CDN[CloudFlare CDN<br/>DDoS Protection]
        WAF[Web Application Firewall<br/>OWASP Protection]
        RATE_LIMIT[Rate Limiting<br/>API Throttling]
    end
    
    subgraph "Network Security Layer"
        VPC[Virtual Private Cloud<br/>Network Isolation]
        SUBNETS[Private Subnets<br/>Service Segmentation]
        NAT[NAT Gateway<br/>Outbound Control]
        VPN[VPN Gateway<br/>Admin Access]
    end
    
    subgraph "Application Security Layer"
        AUTH[OAuth 2.0 + JWT<br/>Multi-Factor Auth]
        AUTHZ[RBAC + ABAC<br/>Fine-Grained Permissions]
        SESSION[Session Management<br/>Redis Secure Store]
        CSRF[CSRF Protection<br/>Token Validation]
    end
    
    subgraph "Data Security Layer"
        ENCRYPTION[AES-256 Encryption<br/>Data at Rest]
        TLS[TLS 1.3<br/>Data in Transit]
        KEY_MGMT[AWS KMS<br/>Key Management]
        BACKUP[Encrypted Backups<br/>Cross-Region]
    end
    
    subgraph "Infrastructure Security Layer"
        CONTAINER[Container Security<br/>Image Scanning]
        SECRETS[HashiCorp Vault<br/>Secret Management]
        MONITORING[Security Monitoring<br/>SIEM Integration]
        COMPLIANCE[Compliance Automation<br/>ISO 27001/SOC 2]
    end
    
    subgraph "Identity & Access Management"
        SSO[Single Sign-On<br/>SAML/OIDC]
        MFA[Multi-Factor Auth<br/>TOTP/SMS/Biometric]
        IDENTITY[Identity Provider<br/>User Directory]
        AUDIT[Access Audit<br/>Activity Logging]
    end
    
    CDN --> WAF
    WAF --> RATE_LIMIT
    RATE_LIMIT --> VPC
    
    VPC --> SUBNETS
    SUBNETS --> AUTH
    AUTH --> AUTHZ
    
    AUTHZ --> ENCRYPTION
    ENCRYPTION --> KEY_MGMT
    
    CONTAINER --> SECRETS
    SECRETS --> MONITORING
    
    SSO --> MFA
    MFA --> IDENTITY
    IDENTITY --> AUDIT
```

### Security Compliance Framework

**Comprehensive Security Standards Implementation**
```yaml
security_compliance:
  international_standards:
    iso_27001:
      status: "Implementation in progress"
      certification_target: "Q2 2025"
      scope: "Complete information security management system"
      controls_implemented: 114
      
    soc_2_type_ii:
      status: "Assessment scheduled"
      audit_firm: "Big 4 accounting firm"
      reporting_period: "12 months"
      trust_criteria: ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"]
      
    gdpr_compliance:
      status: "Fully compliant"
      data_protection_officer: "Appointed"
      privacy_by_design: true
      right_to_erasure: "Automated"
      data_portability: "API-enabled"
      
  japan_specific:
    personal_information_protection_act:
      status: "Fully compliant"
      registration_authority: "個人情報保護委員会"
      data_handling_procedures: "Documented and audited"
      cross_border_transfer: "Adequate protection measures"
      
    employment_security_act:
      status: "Compliance verified"
      employment_agency_license: "Application in progress"
      data_retention_policies: "Legal requirements met"
      worker_privacy_protection: "Enhanced measures"
      
  industry_standards:
    owasp_top_10:
      coverage: "100%"
      automated_testing: true
      penetration_testing: "Quarterly"
      
    nist_cybersecurity_framework:
      maturity_level: "Level 4 - Adaptive"
      implementation: "95%"
      continuous_monitoring: true
```

## 11.2 Authentication & Authorization

### Multi-Factor Authentication Implementation

**Advanced Authentication System**
```typescript
// Multi-Factor Authentication Service
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RateLimiter } from 'limiter';

interface AuthenticationContext {
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  geoLocation?: GeoLocation;
  riskScore: number;
  timestamp: Date;
}

interface MFAConfiguration {
  totpEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  biometricEnabled: boolean;
  backupCodesEnabled: boolean;
  requiredFactors: number;
}

class MultiFactorAuthenticationService {
  private totpService: TOTPService;
  private smsService: SMSService;
  private emailService: EmailService;
  private biometricService: BiometricService;
  private rateLimiter: RateLimiter;
  private riskAnalyzer: RiskAnalyzer;
  
  constructor() {
    this.totpService = new TOTPService();
    this.smsService = new SMSService();
    this.emailService = new EmailService();
    this.biometricService = new BiometricService();
    this.rateLimiter = new RateLimiter(5, 'minute'); // 5 attempts per minute
    this.riskAnalyzer = new RiskAnalyzer();
  }
  
  async authenticateUser(
    credentials: UserCredentials,
    context: AuthenticationContext
  ): Promise<AuthenticationResult> {
    try {
      // Rate limiting check
      if (!await this.checkRateLimit(context.userId, context.ipAddress)) {
        throw new AuthenticationError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
      }
      
      // Primary factor verification (password)
      const primaryAuth = await this.verifyPrimaryFactor(credentials);
      if (!primaryAuth.success) {
        await this.logFailedAttempt(context, 'PRIMARY_FACTOR_FAILED');
        throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
      }
      
      // Risk assessment
      const riskScore = await this.riskAnalyzer.assessRisk(context);
      const mfaConfig = await this.getMFAConfiguration(credentials.userId);
      
      // Determine required MFA factors based on risk
      const requiredFactors = this.determineRequiredFactors(riskScore, mfaConfig);
      
      if (requiredFactors === 0) {
        // Low risk, single factor sufficient
        return await this.generateAuthenticationResult(credentials.userId, context);
      }
      
      // Multi-factor authentication required
      const mfaSession = await this.initiateMFASession(credentials.userId, context, requiredFactors);
      
      return {
        success: false,
        requiresMFA: true,
        mfaSessionId: mfaSession.id,
        availableFactors: await this.getAvailableFactors(credentials.userId),
        requiredFactors: requiredFactors,
        riskScore: riskScore,
      };
      
    } catch (error) {
      await this.logSecurityEvent('AUTHENTICATION_ERROR', context, { error: error.message });
      throw error;
    }
  }
  
  async verifyMFAFactor(
    mfaSessionId: string,
    factorType: MFAFactorType,
    factorValue: string,
    context: AuthenticationContext
  ): Promise<MFAVerificationResult> {
    const session = await this.getMFASession(mfaSessionId);
    if (!session || session.isExpired()) {
      throw new AuthenticationError('Invalid or expired MFA session', 'INVALID_MFA_SESSION');
    }
    
    let verificationResult: boolean = false;
    
    switch (factorType) {
      case 'TOTP':
        verificationResult = await this.totpService.verifyToken(session.userId, factorValue);
        break;
      case 'SMS':
        verificationResult = await this.smsService.verifyCode(session.userId, factorValue);
        break;
      case 'EMAIL':
        verificationResult = await this.emailService.verifyCode(session.userId, factorValue);
        break;
      case 'BIOMETRIC':
        verificationResult = await this.biometricService.verifyBiometric(
          session.userId, 
          factorValue, 
          context.deviceId
        );
        break;
      case 'BACKUP_CODE':
        verificationResult = await this.verifyBackupCode(session.userId, factorValue);
        break;
      default:
        throw new AuthenticationError('Unsupported MFA factor', 'UNSUPPORTED_MFA_FACTOR');
    }
    
    if (verificationResult) {
      session.completedFactors.push(factorType);
      await this.updateMFASession(session);
      
      // Check if all required factors are completed
      if (session.completedFactors.length >= session.requiredFactors) {
        const authResult = await this.generateAuthenticationResult(session.userId, context);
        await this.completeMFASession(session);
        return {
          success: true,
          authenticationComplete: true,
          authResult: authResult,
        };
      } else {
        return {
          success: true,
          authenticationComplete: false,
          remainingFactors: session.requiredFactors - session.completedFactors.length,
        };
      }
    } else {
      await this.logFailedAttempt(context, `MFA_FACTOR_FAILED_${factorType}`);
      throw new AuthenticationError('Invalid MFA factor', 'INVALID_MFA_FACTOR');
    }
  }
  
  async setupTOTP(userId: string): Promise<TOTPSetupResult> {
    const user = await this.getUser(userId);
    const secret = speakeasy.generateSecret({
      name: `iWORKZ (${user.email})`,
      issuer: 'iWORKZ',
      length: 32,
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    // Store secret temporarily (user must verify before enabling)
    await this.storeTempTOTPSecret(userId, secret.base32);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: await this.generateBackupCodes(userId),
    };
  }
  
  async enableTOTP(userId: string, verificationToken: string): Promise<boolean> {
    const tempSecret = await this.getTempTOTPSecret(userId);
    if (!tempSecret) {
      throw new AuthenticationError('No TOTP setup in progress', 'NO_TOTP_SETUP');
    }
    
    const isValid = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token: verificationToken,
      window: 2, // Allow for time drift
    });
    
    if (isValid) {
      await this.storeTOTPSecret(userId, tempSecret);
      await this.removeTempTOTPSecret(userId);
      await this.enableMFAFactor(userId, 'TOTP');
      
      await this.logSecurityEvent('TOTP_ENABLED', { userId }, {});
      return true;
    } else {
      throw new AuthenticationError('Invalid TOTP token', 'INVALID_TOTP_TOKEN');
    }
  }
  
  private async verifyPrimaryFactor(credentials: UserCredentials): Promise<AuthResult> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) {
      return { success: false, reason: 'USER_NOT_FOUND' };
    }
    
    // Check account status
    if (user.status === 'SUSPENDED' || user.status === 'LOCKED') {
      return { success: false, reason: 'ACCOUNT_SUSPENDED' };
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!passwordValid) {
      await this.incrementFailedLoginAttempts(user.id);
      return { success: false, reason: 'INVALID_PASSWORD' };
    }
    
    // Reset failed attempts on successful login
    await this.resetFailedLoginAttempts(user.id);
    
    return { success: true, userId: user.id };
  }
  
  private determineRequiredFactors(riskScore: number, config: MFAConfiguration): number {
    if (riskScore >= 0.8) {
      return Math.min(config.requiredFactors + 1, 3); // High risk: additional factor
    } else if (riskScore >= 0.5) {
      return config.requiredFactors; // Medium risk: standard requirements
    } else if (riskScore >= 0.2) {
      return Math.max(config.requiredFactors - 1, 1); // Low risk: reduced requirements
    } else {
      return 0; // Very low risk: single factor may suffice
    }
  }
  
  private async generateAuthenticationResult(
    userId: string, 
    context: AuthenticationContext
  ): Promise<AuthenticationResult> {
    // Generate JWT tokens
    const accessToken = await this.generateAccessToken(userId, context);
    const refreshToken = await this.generateRefreshToken(userId, context);
    
    // Create session
    const session = await this.createUserSession(userId, context, refreshToken);
    
    // Update last login
    await this.updateLastLogin(userId, context);
    
    // Log successful authentication
    await this.logSecurityEvent('AUTHENTICATION_SUCCESS', context, { userId });
    
    return {
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: 900, // 15 minutes
      sessionId: session.id,
      user: await this.getUserProfile(userId),
    };
  }
}

class TOTPService {
  async verifyToken(userId: string, token: string): Promise<boolean> {
    const secret = await this.getTOTPSecret(userId);
    if (!secret) {
      return false;
    }
    
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow for 30-second time drift
    });
  }
  
  private async getTOTPSecret(userId: string): Promise<string | null> {
    // Implementation would retrieve TOTP secret from secure storage
    // This should be encrypted at rest
    return null;
  }
}

class RiskAnalyzer {
  async assessRisk(context: AuthenticationContext): Promise<number> {
    let riskScore = 0.0;
    
    // Device recognition
    const deviceRisk = await this.assessDeviceRisk(context.deviceId, context.userId);
    riskScore += deviceRisk * 0.3;
    
    // Geolocation analysis
    const locationRisk = await this.assessLocationRisk(context.geoLocation, context.userId);
    riskScore += locationRisk * 0.25;
    
    // Behavioral analysis
    const behaviorRisk = await this.assessBehaviorRisk(context);
    riskScore += behaviorRisk * 0.2;
    
    // Time-based analysis
    const timeRisk = await this.assessTimeRisk(context.timestamp, context.userId);
    riskScore += timeRisk * 0.15;
    
    // Network analysis
    const networkRisk = await this.assessNetworkRisk(context.ipAddress);
    riskScore += networkRisk * 0.1;
    
    return Math.min(Math.max(riskScore, 0.0), 1.0);
  }
  
  private async assessDeviceRisk(deviceId: string, userId: string): Promise<number> {
    const knownDevices = await this.getKnownDevices(userId);
    
    if (knownDevices.includes(deviceId)) {
      return 0.1; // Known device, low risk
    } else {
      return 0.8; // Unknown device, high risk
    }
  }
  
  private async assessLocationRisk(geoLocation: GeoLocation, userId: string): Promise<number> {
    if (!geoLocation) {
      return 0.5; // Unknown location, medium risk
    }
    
    const userLocations = await this.getUserLocationHistory(userId);
    const isKnownLocation = userLocations.some(location => 
      this.calculateDistance(geoLocation, location) < 100 // Within 100km
    );
    
    if (isKnownLocation) {
      return 0.1; // Known location, low risk
    } else {
      const isHighRiskCountry = await this.isHighRiskCountry(geoLocation.country);
      return isHighRiskCountry ? 0.9 : 0.6; // New location risk
    }
  }
  
  private async assessBehaviorRisk(context: AuthenticationContext): Promise<number> {
    // Analyze user behavior patterns
    const behaviorProfile = await this.getUserBehaviorProfile(context.userId);
    
    if (!behaviorProfile) {
      return 0.3; // New user, medium-low risk
    }
    
    // Compare current behavior to historical patterns
    const timingAnomaly = this.detectTimingAnomaly(context.timestamp, behaviorProfile);
    const patternAnomaly = this.detectPatternAnomaly(context, behaviorProfile);
    
    return Math.max(timingAnomaly, patternAnomaly);
  }
  
  private calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.latitude - loc1.latitude);
    const dLon = this.toRadians(loc2.longitude - loc1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.latitude)) * Math.cos(this.toRadians(loc2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

### Role-Based Access Control (RBAC)

**Fine-Grained Permission System**
```typescript
// Advanced RBAC Implementation
interface Permission {
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inheritsFrom?: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PermissionCondition {
  type: 'ATTRIBUTE' | 'TIME' | 'LOCATION' | 'CONTEXT';
  attribute?: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN';
  value: any;
}

class RoleBasedAccessControl {
  private roleRepository: RoleRepository;
  private permissionRepository: PermissionRepository;
  private userRoleRepository: UserRoleRepository;
  private policyEngine: PolicyEngine;
  
  constructor() {
    this.roleRepository = new RoleRepository();
    this.permissionRepository = new PermissionRepository();
    this.userRoleRepository = new UserRoleRepository();
    this.policyEngine = new PolicyEngine();
  }
  
  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================
  
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    // Validate role hierarchy (prevent circular inheritance)
    if (roleData.inheritsFrom) {
      await this.validateRoleHierarchy(roleData.inheritsFrom);
    }
    
    const role: Role = {
      id: this.generateId(),
      name: roleData.name,
      description: roleData.description,
      permissions: await this.expandPermissions(roleData.permissions),
      inheritsFrom: roleData.inheritsFrom,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.roleRepository.create(role);
    await this.logSecurityEvent('ROLE_CREATED', { roleId: role.id, roleName: role.name });
    
    return role;
  }
  
  async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if assigner has permission to assign this role
    const canAssign = await this.checkPermission(assignedBy, 'roles', 'assign', { roleId });
    if (!canAssign) {
      throw new PermissionError('Insufficient privileges to assign role');
    }
    
    await this.userRoleRepository.assignRole(userId, roleId, assignedBy);
    await this.invalidateUserPermissionCache(userId);
    
    await this.logSecurityEvent('ROLE_ASSIGNED', {
      userId,
      roleId,
      roleName: role.name,
      assignedBy,
    });
  }
  
  async revokeRoleFromUser(userId: string, roleId: string, revokedBy: string): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    // Check if revoker has permission to revoke this role
    const canRevoke = await this.checkPermission(revokedBy, 'roles', 'revoke', { roleId });
    if (!canRevoke) {
      throw new PermissionError('Insufficient privileges to revoke role');
    }
    
    await this.userRoleRepository.revokeRole(userId, roleId, revokedBy);
    await this.invalidateUserPermissionCache(userId);
    
    await this.logSecurityEvent('ROLE_REVOKED', {
      userId,
      roleId,
      roleName: role.name,
      revokedBy,
    });
  }
  
  // ============================================================================
  // PERMISSION CHECKING
  // ============================================================================
  
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: any
  ): Promise<boolean> {
    try {
      // Get user's effective permissions (from cache if available)
      const userPermissions = await this.getUserEffectivePermissions(userId);
      
      // Find matching permissions
      const matchingPermissions = userPermissions.filter(permission =>
        this.matchesResource(permission.resource, resource) &&
        this.matchesAction(permission.action, action)
      );
      
      if (matchingPermissions.length === 0) {
        return false;
      }
      
      // Evaluate conditions for each matching permission
      for (const permission of matchingPermissions) {
        if (await this.evaluatePermissionConditions(permission, context, userId)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false; // Fail secure
    }
  }
  
  async getUserEffectivePermissions(userId: string): Promise<Permission[]> {
    // Check cache first
    const cacheKey = `user_permissions:${userId}`;
    let permissions = await this.getFromCache(cacheKey);
    
    if (!permissions) {
      // Calculate effective permissions
      const userRoles = await this.userRoleRepository.getUserRoles(userId);
      permissions = await this.calculateEffectivePermissions(userRoles);
      
      // Cache for 15 minutes
      await this.setCache(cacheKey, permissions, 900);
    }
    
    return permissions;
  }
  
  private async calculateEffectivePermissions(roleIds: string[]): Promise<Permission[]> {
    const allPermissions: Permission[] = [];
    const processedRoles = new Set<string>();
    
    // Process roles with inheritance
    const rolesToProcess = [...roleIds];
    
    while (rolesToProcess.length > 0) {
      const roleId = rolesToProcess.shift()!;
      
      if (processedRoles.has(roleId)) {
        continue; // Already processed
      }
      
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        continue;
      }
      
      processedRoles.add(roleId);
      
      // Add role's permissions
      allPermissions.push(...role.permissions);
      
      // Add inherited roles to processing queue
      if (role.inheritsFrom) {
        rolesToProcess.push(...role.inheritsFrom);
      }
    }
    
    // Deduplicate permissions
    return this.deduplicatePermissions(allPermissions);
  }
  
  private async evaluatePermissionConditions(
    permission: Permission,
    context: any,
    userId: string
  ): Promise<boolean> {
    if (!permission.conditions || permission.conditions.length === 0) {
      return true; // No conditions to check
    }
    
    for (const condition of permission.conditions) {
      if (!await this.evaluateCondition(condition, context, userId)) {
        return false; // All conditions must pass
      }
    }
    
    return true;
  }
  
  private async evaluateCondition(
    condition: PermissionCondition,
    context: any,
    userId: string
  ): Promise<boolean> {
    let actualValue: any;
    
    switch (condition.type) {
      case 'ATTRIBUTE':
        actualValue = await this.getUserAttribute(userId, condition.attribute!);
        break;
      case 'TIME':
        actualValue = new Date();
        break;
      case 'LOCATION':
        actualValue = context?.geoLocation;
        break;
      case 'CONTEXT':
        actualValue = context?.[condition.attribute!];
        break;
      default:
        return false;
    }
    
    return this.evaluateOperator(actualValue, condition.operator, condition.value);
  }
  
  private evaluateOperator(actualValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'EQUALS':
        return actualValue === expectedValue;
      case 'NOT_EQUALS':
        return actualValue !== expectedValue;
      case 'CONTAINS':
        return actualValue && actualValue.includes && actualValue.includes(expectedValue);
      case 'GREATER_THAN':
        return actualValue > expectedValue;
      case 'LESS_THAN':
        return actualValue < expectedValue;
      case 'IN':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      case 'NOT_IN':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      default:
        return false;
    }
  }
  
  // ============================================================================
  // PREDEFINED SYSTEM ROLES
  // ============================================================================
  
  async initializeSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        permissions: [
          { resource: '*', action: '*' }, // Full access
        ],
        isSystem: true,
      },
      {
        name: 'platform_admin',
        description: 'Platform Administrator',
        permissions: [
          { resource: 'users', action: 'create' },
          { resource: 'users', action: 'read' },
          { resource: 'users', action: 'update' },
          { resource: 'users', action: 'delete' },
          { resource: 'roles', action: 'create' },
          { resource: 'roles', action: 'read' },
          { resource: 'roles', action: 'update' },
          { resource: 'roles', action: 'assign' },
          { resource: 'roles', action: 'revoke' },
          { resource: 'companies', action: 'verify' },
          { resource: 'companies', action: 'suspend' },
          { resource: 'jobs', action: 'moderate' },
          { resource: 'analytics', action: 'read' },
          { resource: 'compliance', action: 'review' },
        ],
        isSystem: true,
      },
      {
        name: 'hr_manager',
        description: 'Human Resources Manager',
        permissions: [
          { resource: 'candidates', action: 'read' },
          { resource: 'candidates', action: 'search' },
          { resource: 'jobs', action: 'create' },
          { resource: 'jobs', action: 'read' },
          { resource: 'jobs', action: 'update' },
          { resource: 'jobs', action: 'delete', conditions: [
            { type: 'ATTRIBUTE', attribute: 'company_id', operator: 'EQUALS', value: '{user.company_id}' }
          ]},
          { resource: 'applications', action: 'read' },
          { resource: 'applications', action: 'update' },
          { resource: 'matches', action: 'read' },
          { resource: 'interviews', action: 'schedule' },
          { resource: 'offers', action: 'create' },
          { resource: 'company_analytics', action: 'read' },
        ],
        isSystem: true,
      },
      {
        name: 'recruiter',
        description: 'External Recruiter',
        permissions: [
          { resource: 'candidates', action: 'read', conditions: [
            { type: 'ATTRIBUTE', attribute: 'profile_visibility', operator: 'IN', value: ['public', 'recruiter_only'] }
          ]},
          { resource: 'candidates', action: 'search' },
          { resource: 'jobs', action: 'read' },
          { resource: 'matches', action: 'read' },
          { resource: 'applications', action: 'submit' },
          { resource: 'candidates', action: 'contact', conditions: [
            { type: 'ATTRIBUTE', attribute: 'contact_preferences.recruiter_contact', operator: 'EQUALS', value: true }
          ]},
        ],
        isSystem: true,
      },
      {
        name: 'employer',
        description: 'Company Employer/Hiring Manager',
        permissions: [
          { resource: 'jobs', action: 'create', conditions: [
            { type: 'ATTRIBUTE', attribute: 'company_id', operator: 'EQUALS', value: '{user.company_id}' }
          ]},
          { resource: 'jobs', action: 'read' },
          { resource: 'jobs', action: 'update', conditions: [
            { type: 'ATTRIBUTE', attribute: 'company_id', operator: 'EQUALS', value: '{user.company_id}' }
          ]},
          { resource: 'candidates', action: 'read', conditions: [
            { type: 'CONTEXT', attribute: 'via_application', operator: 'EQUALS', value: true }
          ]},
          { resource: 'applications', action: 'read' },
          { resource: 'applications', action: 'update' },
          { resource: 'matches', action: 'read' },
          { resource: 'interviews', action: 'schedule' },
          { resource: 'company_profile', action: 'update', conditions: [
            { type: 'ATTRIBUTE', attribute: 'company_id', operator: 'EQUALS', value: '{user.company_id}' }
          ]},
        ],
        isSystem: true,
      },
      {
        name: 'candidate',
        description: 'Job Seeking Candidate',
        permissions: [
          { resource: 'jobs', action: 'read' },
          { resource: 'jobs', action: 'search' },
          { resource: 'applications', action: 'create' },
          { resource: 'applications', action: 'read', conditions: [
            { type: 'ATTRIBUTE', attribute: 'candidate_id', operator: 'EQUALS', value: '{user.profile_id}' }
          ]},
          { resource: 'applications', action: 'update', conditions: [
            { type: 'ATTRIBUTE', attribute: 'candidate_id', operator: 'EQUALS', value: '{user.profile_id}' }
          ]},
          { resource: 'candidate_profile', action: 'read', conditions: [
            { type: 'ATTRIBUTE', attribute: 'user_id', operator: 'EQUALS', value: '{user.id}' }
          ]},
          { resource: 'candidate_profile', action: 'update', conditions: [
            { type: 'ATTRIBUTE', attribute: 'user_id', operator: 'EQUALS', value: '{user.id}' }
          ]},
          { resource: 'matches', action: 'read', conditions: [
            { type: 'ATTRIBUTE', attribute: 'candidate_id', operator: 'EQUALS', value: '{user.profile_id}' }
          ]},
          { resource: 'interviews', action: 'accept' },
          { resource: 'interviews', action: 'reschedule' },
          { resource: 'offers', action: 'respond' },
        ],
        isSystem: true,
      },
      {
        name: 'compliance_officer',
        description: 'Compliance and Legal Officer',
        permissions: [
          { resource: 'compliance', action: 'read' },
          { resource: 'compliance', action: 'review' },
          { resource: 'compliance', action: 'approve' },
          { resource: 'compliance', action: 'reject' },
          { resource: 'audit_logs', action: 'read' },
          { resource: 'users', action: 'read' },
          { resource: 'jobs', action: 'read' },
          { resource: 'jobs', action: 'moderate' },
          { resource: 'candidates', action: 'read' },
          { resource: 'regulatory_reports', action: 'generate' },
          { resource: 'data_requests', action: 'process' },
        ],
        isSystem: true,
      },
    ];
    
    for (const roleData of systemRoles) {
      const existingRole = await this.roleRepository.findByName(roleData.name);
      if (!existingRole) {
        await this.roleRepository.create({
          id: this.generateId(),
          ...roleData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private matchesResource(permissionResource: string, requestedResource: string): boolean {
    if (permissionResource === '*') {
      return true; // Wildcard matches everything
    }
    
    if (permissionResource === requestedResource) {
      return true; // Exact match
    }
    
    // Check for pattern matching (e.g., "users.*" matches "users.profile")
    if (permissionResource.endsWith('*')) {
      const prefix = permissionResource.slice(0, -1);
      return requestedResource.startsWith(prefix);
    }
    
    return false;
  }
  
  private matchesAction(permissionAction: string, requestedAction: string): boolean {
    if (permissionAction === '*') {
      return true; // Wildcard matches everything
    }
    
    return permissionAction === requestedAction;
  }
  
  private deduplicatePermissions(permissions: Permission[]): Permission[] {
    const seen = new Set<string>();
    const result: Permission[] = [];
    
    for (const permission of permissions) {
      const key = `${permission.resource}:${permission.action}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(permission);
      }
    }
    
    return result;
  }
  
  private generateId(): string {
    return crypto.randomUUID();
  }
  
  private async validateRoleHierarchy(inheritsFrom: string[]): Promise<void> {
    // Implementation would check for circular dependencies
    // This is a simplified version
    for (const roleId of inheritsFrom) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new Error(`Inherited role ${roleId} not found`);
      }
    }
  }
  
  private async expandPermissions(permissions: Permission[]): Promise<Permission[]> {
    // Implementation would expand any template permissions
    return permissions;
  }
  
  private async logSecurityEvent(event: string, context: any, metadata?: any): Promise<void> {
    // Implementation would log to security audit system
    console.log(`Security Event: ${event}`, { context, metadata, timestamp: new Date() });
  }
  
  private async getUserById(userId: string): Promise<any> {
    // Implementation would fetch user from database
    return null;
  }
  
  private async getUserAttribute(userId: string, attribute: string): Promise<any> {
    // Implementation would fetch user attribute from database
    return null;
  }
  
  private async invalidateUserPermissionCache(userId: string): Promise<void> {
    const cacheKey = `user_permissions:${userId}`;
    await this.deleteFromCache(cacheKey);
  }
  
  private async getFromCache(key: string): Promise<any> {
    // Implementation would get from Redis cache
    return null;
  }
  
  private async setCache(key: string, value: any, ttl: number): Promise<void> {
    // Implementation would set in Redis cache
  }
  
  private async deleteFromCache(key: string): Promise<void> {
    // Implementation would delete from Redis cache
  }
}

// Usage Examples
async function exampleUsage() {
  const rbac = new RoleBasedAccessControl();
  
  // Initialize system roles
  await rbac.initializeSystemRoles();
  
  // Check if user can create a job posting
  const canCreateJob = await rbac.checkPermission(
    'user123', 
    'jobs', 
    'create', 
    { company_id: 'company456' }
  );
  
  // Assign role to user
  await rbac.assignRoleToUser('user123', 'hr_manager', 'admin456');
  
  // Create custom role
  const customRole = await rbac.createRole({
    name: 'senior_recruiter',
    description: 'Senior Recruiter with additional privileges',
    permissions: [
      { resource: 'candidates', action: 'read' },
      { resource: 'candidates', action: 'search' },
      { resource: 'candidates', action: 'contact' },
      { resource: 'jobs', action: 'read' },
      { resource: 'analytics', action: 'read', conditions: [
        { type: 'ATTRIBUTE', attribute: 'department', operator: 'EQUALS', value: 'recruitment' }
      ]},
    ],
    inheritsFrom: ['recruiter'], // Inherit from base recruiter role
  });
}
```

## 11.3 Data Encryption & Protection

### Comprehensive Data Protection Strategy

**Multi-Layer Encryption Implementation**
```typescript
// Advanced Data Encryption Service
import crypto from 'crypto';
import { KMSClient, EncryptCommand, DecryptCommand, GenerateDataKeyCommand } from '@aws-sdk/client-kms';

interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  kmsKeyId: string;
  dataKeySpec: string;
  encryptionContext: Record<string, string>;
}

interface EncryptedData {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
  algorithm: string;
  keyId: string;
  authTag?: string;
}

class DataEncryptionService {
  private kmsClient: KMSClient;
  private config: EncryptionConfig;
  private dataKeyCache: Map<string, { key: Buffer; expiresAt: Date }>;
  
  constructor(config: EncryptionConfig) {
    this.config = config;
    this.kmsClient = new KMSClient({
      region: process.env.AWS_REGION || 'ap-northeast-1',
    });
    this.dataKeyCache = new Map();
  }
  
  // ============================================================================
  // FIELD-LEVEL ENCRYPTION
  // ============================================================================
  
  async encryptField(
    data: string | Buffer,
    fieldType: DataFieldType,
    context?: Record<string, string>
  ): Promise<EncryptedData> {
    const dataKey = await this.getDataEncryptionKey(fieldType);
    const algorithm = this.config.algorithm;
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, dataKey.key, { iv });
    
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get auth tag for GCM mode
    const authTag = (cipher as any).getAuthTag ? (cipher as any).getAuthTag() : undefined;
    
    return {
      encryptedData: encrypted,
      encryptedKey: dataKey.encryptedKey,
      iv: iv.toString('base64'),
      algorithm: algorithm,
      keyId: this.config.kmsKeyId,
      authTag: authTag ? authTag.toString('base64') : undefined,
    };
  }
  
  async decryptField(encryptedData: EncryptedData): Promise<string> {
    // Decrypt the data encryption key
    const dataKey = await this.decryptDataKey(encryptedData.encryptedKey);
    
    const decipher = crypto.createDecipher(
      encryptedData.algorithm,
      dataKey,
      { iv: Buffer.from(encryptedData.iv, 'base64') }
    );
    
    // Set auth tag for GCM mode
    if (encryptedData.authTag) {
      (decipher as any).setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));
    }
    
    let decrypted = decipher.update(encryptedData.encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // ============================================================================
  // DATABASE ENCRYPTION
  // ============================================================================
  
  async encryptSensitiveFields(data: any, schema: EncryptionSchema): Promise<any> {
    const encryptedData = { ...data };
    
    for (const [fieldPath, fieldConfig] of Object.entries(schema.fields)) {
      const fieldValue = this.getNestedValue(data, fieldPath);
      
      if (fieldValue !== undefined && fieldValue !== null) {
        if (fieldConfig.encrypt) {
          const encrypted = await this.encryptField(
            fieldValue.toString(),
            fieldConfig.type,
            { field: fieldPath, ...fieldConfig.context }
          );
          
          this.setNestedValue(encryptedData, fieldPath, encrypted);
          
          // Add metadata for field
          this.setNestedValue(encryptedData, `${fieldPath}_encrypted`, true);
          this.setNestedValue(encryptedData, `${fieldPath}_encryption_version`, '1.0');
        }
      }
    }
    
    return encryptedData;
  }
  
  async decryptSensitiveFields(data: any, schema: EncryptionSchema): Promise<any> {
    const decryptedData = { ...data };
    
    for (const [fieldPath, fieldConfig] of Object.entries(schema.fields)) {
      const isEncrypted = this.getNestedValue(data, `${fieldPath}_encrypted`);
      
      if (isEncrypted && fieldConfig.encrypt) {
        const encryptedValue = this.getNestedValue(data, fieldPath);
        
        if (encryptedValue && typeof encryptedValue === 'object') {
          try {
            const decrypted = await this.decryptField(encryptedValue);
            this.setNestedValue(decryptedData, fieldPath, decrypted);
            
            // Remove encryption metadata
            delete decryptedData[`${fieldPath}_encrypted`];
            delete decryptedData[`${fieldPath}_encryption_version`];
          } catch (error) {
            console.error(`Failed to decrypt field ${fieldPath}:`, error);
            // Keep encrypted data if decryption fails
          }
        }
      }
    }
    
    return decryptedData;
  }
  
  // ============================================================================
  // FILE ENCRYPTION
  // ============================================================================
  
  async encryptFile(fileBuffer: Buffer, fileName: string): Promise<EncryptedFileResult> {
    const dataKey = await this.getDataEncryptionKey('FILE');
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, dataKey.key, { iv });
    
    const encryptedChunks: Buffer[] = [];
    encryptedChunks.push(cipher.update(fileBuffer));
    encryptedChunks.push(cipher.final());
    
    const authTag = (cipher as any).getAuthTag();
    const encryptedBuffer = Buffer.concat(encryptedChunks);
    
    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    return {
      encryptedData: encryptedBuffer,
      encryptedKey: dataKey.encryptedKey,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      algorithm: algorithm,
      originalSize: fileBuffer.length,
      encryptedSize: encryptedBuffer.length,
      checksum: checksum,
      fileName: fileName,
      encryptedAt: new Date(),
    };
  }
  
  async decryptFile(encryptedFile: EncryptedFileResult): Promise<Buffer> {
    // Decrypt the data encryption key
    const dataKey = await this.decryptDataKey(encryptedFile.encryptedKey);
    
    const decipher = crypto.createDecipher(
      encryptedFile.algorithm,
      dataKey,
      { iv: Buffer.from(encryptedFile.iv, 'base64') }
    );
    
    decipher.setAuthTag(Buffer.from(encryptedFile.authTag, 'base64'));
    
    const decryptedChunks: Buffer[] = [];
    decryptedChunks.push(decipher.update(encryptedFile.encryptedData));
    decryptedChunks.push(decipher.final());
    
    const decryptedBuffer = Buffer.concat(decryptedChunks);
    
    // Verify checksum
    const calculatedChecksum = crypto.createHash('sha256').update(decryptedBuffer).digest('hex');
    if (calculatedChecksum !== encryptedFile.checksum) {
      throw new Error('File integrity check failed');
    }
    
    return decryptedBuffer;
  }
  
  // ============================================================================
  // KEY MANAGEMENT
  // ============================================================================
  
  private async getDataEncryptionKey(
    keyType: DataFieldType | 'FILE'
  ): Promise<{ key: Buffer; encryptedKey: string }> {
    const cacheKey = `${keyType}_${Date.now() - (Date.now() % 3600000)}`; // 1-hour cache
    
    // Check cache first
    const cachedKey = this.dataKeyCache.get(cacheKey);
    if (cachedKey && cachedKey.expiresAt > new Date()) {
      // Return cached key (need to re-encrypt for current use)
      const encryptCommand = new EncryptCommand({
        KeyId: this.config.kmsKeyId,
        Plaintext: cachedKey.key,
        EncryptionContext: {
          keyType: keyType,
          timestamp: new Date().toISOString(),
        },
      });
      
      const encryptResult = await this.kmsClient.send(encryptCommand);
      return {
        key: cachedKey.key,
        encryptedKey: Buffer.from(encryptResult.CiphertextBlob!).toString('base64'),
      };
    }
    
    // Generate new data key
    const generateKeyCommand = new GenerateDataKeyCommand({
      KeyId: this.config.kmsKeyId,
      KeySpec: this.config.dataKeySpec,
      EncryptionContext: {
        keyType: keyType,
        timestamp: new Date().toISOString(),
      },
    });
    
    const keyResult = await this.kmsClient.send(generateKeyCommand);
    
    const dataKey = Buffer.from(keyResult.Plaintext!);
    const encryptedKey = Buffer.from(keyResult.CiphertextBlob!).toString('base64');
    
    // Cache the key for 1 hour
    this.dataKeyCache.set(cacheKey, {
      key: dataKey,
      expiresAt: new Date(Date.now() + 3600000),
    });
    
    return {
      key: dataKey,
      encryptedKey: encryptedKey,
    };
  }
  
  private async decryptDataKey(encryptedKey: string): Promise<Buffer> {
    const decryptCommand = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
      EncryptionContext: this.config.encryptionContext,
    });
    
    const decryptResult = await this.kmsClient.send(decryptCommand);
    return Buffer.from(decryptResult.Plaintext!);
  }
  
  // ============================================================================
  // PERSONAL DATA ANONYMIZATION
  // ============================================================================
  
  async anonymizePersonalData(data: any, schema: AnonymizationSchema): Promise<any> {
    const anonymizedData = { ...data };
    
    for (const [fieldPath, config] of Object.entries(schema.fields)) {
      const fieldValue = this.getNestedValue(data, fieldPath);
      
      if (fieldValue !== undefined && fieldValue !== null) {
        let anonymizedValue: any;
        
        switch (config.method) {
          case 'HASH':
            anonymizedValue = await this.hashValue(fieldValue.toString(), config.salt);
            break;
          case 'MASK':
            anonymizedValue = this.maskValue(fieldValue.toString(), config.maskPattern);
            break;
          case 'PSEUDONYMIZE':
            anonymizedValue = await this.pseudonymizeValue(fieldValue.toString(), config.key);
            break;
          case 'REMOVE':
            anonymizedValue = null;
            break;
          case 'GENERALIZE':
            anonymizedValue = this.generalizeValue(fieldValue, config.generalizationLevel);
            break;
          default:
            anonymizedValue = fieldValue;
        }
        
        this.setNestedValue(anonymizedData, fieldPath, anonymizedValue);
      }
    }
    
    // Add anonymization metadata
    anonymizedData._anonymized = true;
    anonymizedData._anonymizedAt = new Date().toISOString();
    anonymizedData._anonymizationVersion = schema.version;
    
    return anonymizedData;
  }
  
  private async hashValue(value: string, salt?: string): Promise<string> {
    const hashSalt = salt || crypto.randomBytes(16).toString('hex');
    return crypto.createHash('sha256').update(value + hashSalt).digest('hex');
  }
  
  private maskValue(value: string, pattern?: string): string {
    if (!pattern) {
      // Default masking: show first 2 and last 2 characters
      if (value.length <= 4) {
        return '*'.repeat(value.length);
      }
      return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
    }
    
    // Apply custom mask pattern
    return value.replace(new RegExp(pattern, 'g'), '*');
  }
  
  private async pseudonymizeValue(value: string, key: string): Promise<string> {
    // Deterministic pseudonymization using HMAC
    return crypto.createHmac('sha256', key).update(value).digest('hex');
  }
  
  private generalizeValue(value: any, level: number): any {
    // Implement generalization based on data type and level
    if (typeof value === 'number') {
      // Round to nearest power of 10 based on level
      const factor = Math.pow(10, level);
      return Math.round(value / factor) * factor;
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      // Date generalization
      const date = new Date(value);
      switch (level) {
        case 1: // Month precision
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        case 2: // Year precision
          return date.getFullYear().toString();
        default:
          return value;
      }
    }
    
    return value;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

// Data Classification Types
enum DataFieldType {
  PII = 'PII',                    // Personally Identifiable Information
  FINANCIAL = 'FINANCIAL',       // Financial data
  HEALTH = 'HEALTH',             // Health-related data
  BIOMETRIC = 'BIOMETRIC',       // Biometric data
  SENSITIVE = 'SENSITIVE',       // Other sensitive data
  CONFIDENTIAL = 'CONFIDENTIAL', // Confidential business data
  INTERNAL = 'INTERNAL',         // Internal use only
  PUBLIC = 'PUBLIC',             // Public information
}

interface EncryptionSchema {
  version: string;
  fields: Record<string, {
    type: DataFieldType;
    encrypt: boolean;
    context?: Record<string, string>;
  }>;
}

interface AnonymizationSchema {
  version: string;
  fields: Record<string, {
    method: 'HASH' | 'MASK' | 'PSEUDONYMIZE' | 'REMOVE' | 'GENERALIZE';
    salt?: string;
    maskPattern?: string;
    key?: string;
    generalizationLevel?: number;
  }>;
}

interface EncryptedFileResult {
  encryptedData: Buffer;
  encryptedKey: string;
  iv: string;
  authTag: string;
  algorithm: string;
  originalSize: number;
  encryptedSize: number;
  checksum: string;
  fileName: string;
  encryptedAt: Date;
}

// Example schemas for different data types
const candidateProfileEncryptionSchema: EncryptionSchema = {
  version: '1.0',
  fields: {
    'personalInfo.dateOfBirth': { type: DataFieldType.PII, encrypt: true },
    'personalInfo.passportNumber': { type: DataFieldType.PII, encrypt: true },
    'personalInfo.nationalId': { type: DataFieldType.PII, encrypt: true },
    'contactInfo.phone': { type: DataFieldType.PII, encrypt: true },
    'contactInfo.address': { type: DataFieldType.PII, encrypt: true },
    'bankingInfo.accountNumber': { type: DataFieldType.FINANCIAL, encrypt: true },
    'medicalInfo.conditions': { type: DataFieldType.HEALTH, encrypt: true },
    'biometricData.fingerprint': { type: DataFieldType.BIOMETRIC, encrypt: true },
    'professionalSummary': { type: DataFieldType.CONFIDENTIAL, encrypt: false },
    'skills': { type: DataFieldType.PUBLIC, encrypt: false },
  },
};

const candidateAnonymizationSchema: AnonymizationSchema = {
  version: '1.0',
  fields: {
    'personalInfo.firstName': { method: 'PSEUDONYMIZE', key: 'name_key' },
    'personalInfo.lastName': { method: 'PSEUDONYMIZE', key: 'name_key' },
    'personalInfo.dateOfBirth': { method: 'GENERALIZE', generalizationLevel: 2 },
    'contactInfo.email': { method: 'HASH', salt: 'email_salt' },
    'contactInfo.phone': { method: 'MASK', maskPattern: '\\d(?=\\d{4})' },
    'contactInfo.address': { method: 'GENERALIZE', generalizationLevel: 1 },
    'salary.current': { method: 'GENERALIZE', generalizationLevel: 1 },
    'personalInfo.passportNumber': { method: 'REMOVE' },
    'personalInfo.nationalId': { method: 'REMOVE' },
  },
};

export {
  DataEncryptionService,
  DataFieldType,
  candidateProfileEncryptionSchema,
  candidateAnonymizationSchema,
};
```

## 11.4 Security Monitoring & Incident Response

### Real-Time Security Operations Center (SOC)

**Advanced Security Monitoring Implementation**
```typescript
// Security Information and Event Management (SIEM) System
import { EventEmitter } from 'events';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  source: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  geoLocation?: GeoLocation;
  metadata: Record<string, any>;
  riskScore: number;
  correlationId?: string;
}

enum SecurityEventType {
  AUTHENTICATION_SUCCESS = 'AUTHENTICATION_SUCCESS',
  AUTHENTICATION_FAILURE = 'AUTHENTICATION_FAILURE',
  AUTHORIZATION_FAILURE = 'AUTHORIZATION_FAILURE',
  SUSPICIOUS_LOGIN = 'SUSPICIOUS_LOGIN',
  MULTIPLE_FAILED_LOGINS = 'MULTIPLE_FAILED_LOGINS',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  DATA_ACCESS_VIOLATION = 'DATA_ACCESS_VIOLATION',
  UNUSUAL_DATA_ACCESS = 'UNUSUAL_DATA_ACCESS',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  CSRF_ATTEMPT = 'CSRF_ATTEMPT',
  BRUTE_FORCE_ATTACK = 'BRUTE_FORCE_ATTACK',
  DDoS_ATTACK = 'DDOS_ATTACK',
  MALWARE_DETECTED = 'MALWARE_DETECTED',
  INSIDER_THREAT = 'INSIDER_THREAT',
  DATA_EXFILTRATION = 'DATA_EXFILTRATION',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  SYSTEM_COMPROMISE = 'SYSTEM_COMPROMISE',
  VULNERABILITY_EXPLOIT = 'VULNERABILITY_EXPLOIT',
}

enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

class SecurityMonitoringService extends EventEmitter {
  private eventRepository: SecurityEventRepository;
  private riskAnalyzer: SecurityRiskAnalyzer;
  private alertManager: SecurityAlertManager;
  private incidentManager: IncidentManager;
  private threatIntelligence: ThreatIntelligenceService;
  private correlationEngine: EventCorrelationEngine;
  
  constructor() {
    super();
    this.eventRepository = new SecurityEventRepository();
    this.riskAnalyzer = new SecurityRiskAnalyzer();
    this.alertManager = new SecurityAlertManager();
    this.incidentManager = new IncidentManager();
    this.threatIntelligence = new ThreatIntelligenceService();
    this.correlationEngine = new EventCorrelationEngine();
    
    this.setupEventHandlers();
  }
  
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event,
    };
    
    // Store event
    await this.eventRepository.store(securityEvent);
    
    // Enrich with threat intelligence
    const enrichedEvent = await this.threatIntelligence.enrichEvent(securityEvent);
    
    // Correlate with other events
    const correlation = await this.correlationEngine.correlateEvent(enrichedEvent);
    
    // Analyze risk
    const riskAssessment = await this.riskAnalyzer.assessEventRisk(enrichedEvent, correlation);
    
    // Generate alerts if necessary
    await this.evaluateForAlerting(enrichedEvent, riskAssessment);
    
    // Emit event for real-time processing
    this.emit('securityEvent', enrichedEvent);
    
    // Check for incident criteria
    await this.evaluateForIncident(enrichedEvent, correlation, riskAssessment);
  }
  
  private async evaluateForAlerting(
    event: SecurityEvent,
    riskAssessment: RiskAssessment
  ): Promise<void> {
    const alertCriteria = [
      // High-severity events
      {
        condition: () => event.severity === SecuritySeverity.CRITICAL,
        alertType: 'CRITICAL_SECURITY_EVENT',
        priority: AlertPriority.IMMEDIATE,
      },
      
      // Multiple failed logins
      {
        condition: async () => {
          if (event.eventType === SecurityEventType.AUTHENTICATION_FAILURE) {
            const recentFailures = await this.getRecentFailedLogins(
              event.ipAddress!, 
              event.userId, 
              15 // last 15 minutes
            );
            return recentFailures >= 5;
          }
          return false;
        },
        alertType: 'BRUTE_FORCE_DETECTED',
        priority: AlertPriority.HIGH,
      },
      
      // Suspicious geolocation
      {
        condition: async () => {
          if (event.geoLocation && event.userId) {
            const isUnusualLocation = await this.isUnusualLocation(
              event.userId, 
              event.geoLocation
            );
            return isUnusualLocation && riskAssessment.score > 0.7;
          }
          return false;
        },
        alertType: 'SUSPICIOUS_LOCATION_LOGIN',
        priority: AlertPriority.MEDIUM,
      },
      
      // Data access violations
      {
        condition: () => event.eventType === SecurityEventType.DATA_ACCESS_VIOLATION,
        alertType: 'UNAUTHORIZED_DATA_ACCESS',
        priority: AlertPriority.HIGH,
      },
      
      // SQL injection attempts
      {
        condition: () => event.eventType === SecurityEventType.SQL_INJECTION_ATTEMPT,
        alertType: 'SQL_INJECTION_ATTACK',
        priority: AlertPriority.HIGH,
      },
      
      // Privilege escalation
      {
        condition: () => event.eventType === SecurityEventType.PRIVILEGE_ESCALATION,
        alertType: 'PRIVILEGE_ESCALATION_DETECTED',
        priority: AlertPriority.CRITICAL,
      },
    ];
    
    for (const criteria of alertCriteria) {
      if (await criteria.condition()) {
        await this.alertManager.createAlert({
          type: criteria.alertType,
          priority: criteria.priority,
          event: event,
          riskAssessment: riskAssessment,
          description: this.generateAlertDescription(event, criteria.alertType),
        });
      }
    }
  }
  
  private async evaluateForIncident(
    event: SecurityEvent,
    correlation: EventCorrelation,
    riskAssessment: RiskAssessment
  ): Promise<void> {
    const incidentCriteria = [
      // Multiple attack vectors from same source
      {
        condition: () => 
          correlation.relatedEvents.length >= 3 &&
          correlation.attackPatterns.length >= 2,
        severity: IncidentSeverity.HIGH,
        type: 'COORDINATED_ATTACK',
      },
      
      // Critical system compromise indicators
      {
        condition: () => 
          event.eventType === SecurityEventType.SYSTEM_COMPROMISE ||
          (riskAssessment.score > 0.9 && event.severity === SecuritySeverity.CRITICAL),
        severity: IncidentSeverity.CRITICAL,
        type: 'SYSTEM_COMPROMISE',
      },
      
      // Data exfiltration indicators
      {
        condition: () => 
          event.eventType === SecurityEventType.DATA_EXFILTRATION ||
          (correlation.dataAccessPatterns.length > 0 && riskAssessment.score > 0.8),
        severity: IncidentSeverity.CRITICAL,
        type: 'DATA_BREACH',
      },
      
      // Insider threat indicators
      {
        condition: () => 
          event.eventType === SecurityEventType.INSIDER_THREAT ||
          (event.userId && riskAssessment.insiderThreatScore > 0.7),
        severity: IncidentSeverity.HIGH,
        type: 'INSIDER_THREAT',
      },
    ];
    
    for (const criteria of incidentCriteria) {
      if (criteria.condition()) {
        await this.incidentManager.createIncident({
          type: criteria.type,
          severity: criteria.severity,
          triggerEvent: event,
          correlation: correlation,
          riskAssessment: riskAssessment,
          description: this.generateIncidentDescription(event, criteria.type),
        });
      }
    }
  }
  
  // ============================================================================
  // AUTOMATED RESPONSE ACTIONS
  // ============================================================================
  
  private setupEventHandlers(): void {
    // Automated response to critical events
    this.on('securityEvent', async (event: SecurityEvent) => {
      switch (event.eventType) {
        case SecurityEventType.BRUTE_FORCE_ATTACK:
          await this.handleBruteForceAttack(event);
          break;
          
        case SecurityEventType.SQL_INJECTION_ATTEMPT:
          await this.handleSQLInjectionAttempt(event);
          break;
          
        case SecurityEventType.SUSPICIOUS_LOGIN:
          await this.handleSuspiciousLogin(event);
          break;
          
        case SecurityEventType.DATA_ACCESS_VIOLATION:
          await this.handleDataAccessViolation(event);
          break;
          
        case SecurityEventType.PRIVILEGE_ESCALATION:
          await this.handlePrivilegeEscalation(event);
          break;
      }
    });
  }
  
  private async handleBruteForceAttack(event: SecurityEvent): Promise<void> {
    // Immediate response: Block IP address
    if (event.ipAddress) {
      await this.blockIPAddress(event.ipAddress, '24 hours', 'Brute force attack detected');
    }
    
    // If user account involved, temporarily lock it
    if (event.userId) {
      await this.temporarilyLockUserAccount(event.userId, '1 hour', 'Brute force attack detected');
    }
    
    // Increase monitoring for related IPs
    if (event.geoLocation) {
      await this.enhanceMonitoringForRegion(event.geoLocation, '48 hours');
    }
  }
  
  private async handleSQLInjectionAttempt(event: SecurityEvent): Promise<void> {
    // Immediate response: Block IP address
    if (event.ipAddress) {
      await this.blockIPAddress(event.ipAddress, '72 hours', 'SQL injection attempt detected');
    }
    
    // Alert security team immediately
    await this.alertManager.createCriticalAlert({
      type: 'SQL_INJECTION_ATTACK',
      event: event,
      description: 'SQL injection attempt detected - immediate investigation required',
      requiresImmedateAction: true,
    });
    
    // Analyze the attack pattern
    await this.analyzeAttackPattern(event);
  }
  
  private async handleSuspiciousLogin(event: SecurityEvent): Promise<void> {
    if (!event.userId) return;
    
    // Require additional MFA verification
    await this.requireAdditionalMFA(event.userId, '24 hours');
    
    // Notify user of suspicious activity
    await this.notifyUserOfSuspiciousActivity(event.userId, event);
    
    // Enhance monitoring for this user
    await this.enhanceUserMonitoring(event.userId, '72 hours');
  }
  
  private async handleDataAccessViolation(event: SecurityEvent): Promise<void> {
    // Immediate response: Suspend user access
    if (event.userId) {
      await this.suspendUserAccess(event.userId, 'Data access violation - pending investigation');
    }
    
    // Create high-priority incident
    await this.incidentManager.createIncident({
      type: 'DATA_ACCESS_VIOLATION',
      severity: IncidentSeverity.HIGH,
      triggerEvent: event,
      description: 'Unauthorized data access detected - immediate investigation required',
      requiresImmedateAction: true,
    });
    
    // Alert compliance team
    await this.alertComplianceTeam(event);
  }
  
  private async handlePrivilegeEscalation(event: SecurityEvent): Promise<void> {
    // Critical response: Immediately suspend user
    if (event.userId) {
      await this.suspendUserAccess(event.userId, 'Privilege escalation detected - account suspended');
    }
    
    // Block IP address
    if (event.ipAddress) {
      await this.blockIPAddress(event.ipAddress, '7 days', 'Privilege escalation attempt');
    }
    
    // Create critical incident
    await this.incidentManager.createIncident({
      type: 'PRIVILEGE_ESCALATION',
      severity: IncidentSeverity.CRITICAL,
      triggerEvent: event,
      description: 'Privilege escalation detected - potential system compromise',
      requiresImmedateAction: true,
    });
    
    // Audit all user's recent activities
    await this.auditUserActivities(event.userId!, '30 days');
  }
  
  // ============================================================================
  // INCIDENT RESPONSE PLAYBOOKS
  // ============================================================================
  
  async executeIncidentPlaybook(incident: SecurityIncident): Promise<void> {
    const playbook = this.getPlaybookForIncident(incident.type);
    
    for (const step of playbook.steps) {
      try {
        await this.executePlaybookStep(step, incident);
        
        // Log step completion
        await this.incidentManager.updateIncident(incident.id, {
          status: 'IN_PROGRESS',
          completedSteps: [...incident.completedSteps, step.id],
          lastUpdated: new Date(),
        });
        
      } catch (error) {
        console.error(`Playbook step ${step.id} failed:`, error);
        
        // Log step failure
        await this.incidentManager.updateIncident(incident.id, {
          status: 'FAILED_STEP',
          failedSteps: [...(incident.failedSteps || []), step.id],
          lastError: error.message,
          lastUpdated: new Date(),
        });
        
        // If critical step fails, escalate
        if (step.critical) {
          await this.escalateIncident(incident.id, `Critical step ${step.id} failed: ${error.message}`);
        }
      }
    }
  }
  
  private getPlaybookForIncident(incidentType: string): IncidentPlaybook {
    const playbooks: Record<string, IncidentPlaybook> = {
      DATA_BREACH: {
        id: 'data_breach_response',
        name: 'Data Breach Response Playbook',
        steps: [
          {
            id: 'immediate_containment',
            name: 'Immediate Containment',
            description: 'Contain the breach to prevent further data exposure',
            critical: true,
            estimatedDuration: 15, // minutes
            actions: [
              'suspend_affected_accounts',
              'block_suspicious_ips',
              'disable_affected_services',
              'preserve_evidence',
            ],
          },
          {
            id: 'impact_assessment',
            name: 'Impact Assessment',
            description: 'Assess the scope and impact of the breach',
            critical: true,
            estimatedDuration: 60,
            actions: [
              'identify_affected_data',
              'count_affected_users',
              'assess_data_sensitivity',
              'evaluate_regulatory_implications',
            ],
          },
          {
            id: 'notification',
            name: 'Stakeholder Notification',
            description: 'Notify required stakeholders within legal timeframes',
            critical: true,
            estimatedDuration: 120,
            actions: [
              'notify_ciso',
              'notify_legal_team',
              'notify_regulatory_authorities',
              'notify_affected_users',
            ],
          },
          {
            id: 'investigation',
            name: 'Forensic Investigation',
            description: 'Conduct detailed investigation to determine root cause',
            critical: false,
            estimatedDuration: 480, // 8 hours
            actions: [
              'collect_forensic_evidence',
              'analyze_attack_vectors',
              'identify_vulnerabilities',
              'trace_attacker_activities',
            ],
          },
          {
            id: 'recovery',
            name: 'System Recovery',
            description: 'Restore systems and implement additional security measures',
            critical: false,
            estimatedDuration: 240,
            actions: [
              'patch_vulnerabilities',
              'restore_from_backups',
              'implement_additional_controls',
              'validate_system_integrity',
            ],
          },
          {
            id: 'post_incident',
            name: 'Post-Incident Activities',
            description: 'Document lessons learned and improve security posture',
            critical: false,
            estimatedDuration: 120,
            actions: [
              'document_incident',
              'conduct_lessons_learned',
              'update_security_policies',
              'improve_detection_capabilities',
            ],
          },
        ],
      },
      
      SYSTEM_COMPROMISE: {
        id: 'system_compromise_response',
        name: 'System Compromise Response Playbook',
        steps: [
          {
            id: 'isolation',
            name: 'System Isolation',
            description: 'Isolate compromised systems to prevent lateral movement',
            critical: true,
            estimatedDuration: 10,
            actions: [
              'isolate_compromised_systems',
              'block_suspicious_network_traffic',
              'preserve_system_state',
              'alert_security_team',
            ],
          },
          {
            id: 'threat_assessment',
            name: 'Threat Assessment',
            description: 'Assess the nature and scope of the compromise',
            critical: true,
            estimatedDuration: 45,
            actions: [
              'analyze_malware_samples',
              'identify_attack_vectors',
              'assess_data_access',
              'evaluate_persistence_mechanisms',
            ],
          },
          {
            id: 'eradication',
            name: 'Threat Eradication',
            description: 'Remove threats from compromised systems',
            critical: true,
            estimatedDuration: 180,
            actions: [
              'remove_malware',
              'patch_vulnerabilities',
              'remove_backdoors',
              'reset_compromised_credentials',
            ],
          },
          {
            id: 'validation',
            name: 'System Validation',
            description: 'Validate that threats have been completely removed',
            critical: true,
            estimatedDuration: 120,
            actions: [
              'scan_for_remaining_threats',
              'validate_system_integrity',
              'test_security_controls',
              'monitor_for_reinfection',
            ],
          },
        ],
      },
    };
    
    return playbooks[incidentType] || playbooks.DATA_BREACH; // Default playbook
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateAlertDescription(event: SecurityEvent, alertType: string): string {
    const descriptions: Record<string, string> = {
      CRITICAL_SECURITY_EVENT: `Critical security event detected: ${event.eventType}`,
      BRUTE_FORCE_DETECTED: `Brute force attack detected from IP ${event.ipAddress}`,
      SUSPICIOUS_LOCATION_LOGIN: `Suspicious login from unusual location: ${event.geoLocation?.country}`,
      UNAUTHORIZED_DATA_ACCESS: `Unauthorized data access attempt by user ${event.userId}`,
      SQL_INJECTION_ATTACK: `SQL injection attempt detected from IP ${event.ipAddress}`,
      PRIVILEGE_ESCALATION_DETECTED: `Privilege escalation attempt by user ${event.userId}`,
    };
    
    return descriptions[alertType] || `Security alert: ${alertType}`;
  }
  
  private generateIncidentDescription(event: SecurityEvent, incidentType: string): string {
    const descriptions: Record<string, string> = {
      COORDINATED_ATTACK: `Coordinated attack detected involving multiple attack vectors`,
      SYSTEM_COMPROMISE: `System compromise detected - immediate investigation required`,
      DATA_BREACH: `Potential data breach detected - unauthorized data access`,
      INSIDER_THREAT: `Insider threat detected - suspicious user behavior patterns`,
    };
    
    return descriptions[incidentType] || `Security incident: ${incidentType}`;
  }
  
  private async getRecentFailedLogins(
    ipAddress: string, 
    userId?: string, 
    minutes: number = 15
  ): Promise<number> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    return await this.eventRepository.count({
      eventType: SecurityEventType.AUTHENTICATION_FAILURE,
      ipAddress: ipAddress,
      userId: userId,
      timestamp: { $gte: cutoffTime },
    });
  }
  
  // Placeholder implementations for security actions
  private async blockIPAddress(ipAddress: string, duration: string, reason: string): Promise<void> {
    console.log(`Blocking IP ${ipAddress} for ${duration}: ${reason}`);
    // Implementation would call firewall/WAF API
  }
  
  private async temporarilyLockUserAccount(userId: string, duration: string, reason: string): Promise<void> {
    console.log(`Locking user ${userId} for ${duration}: ${reason}`);
    // Implementation would call user management service
  }
  
  private async suspendUserAccess(userId: string, reason: string): Promise<void> {
    console.log(`Suspending user ${userId}: ${reason}`);
    // Implementation would call user management service
  }
  
  private async requireAdditionalMFA(userId: string, duration: string): Promise<void> {
    console.log(`Requiring additional MFA for user ${userId} for ${duration}`);
    // Implementation would call MFA service
  }
  
  private async notifyUserOfSuspiciousActivity(userId: string, event: SecurityEvent): Promise<void> {
    console.log(`Notifying user ${userId} of suspicious activity`);
    // Implementation would call notification service
  }
}

// Supporting interfaces
interface RiskAssessment {
  score: number;
  factors: string[];
  insiderThreatScore: number;
  recommendation: string;
}

interface EventCorrelation {
  relatedEvents: SecurityEvent[];
  attackPatterns: string[];
  dataAccessPatterns: string[];
  timelineAnalysis: any;
}

interface SecurityIncident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  status: string;
  triggerEvent: SecurityEvent;
  completedSteps: string[];
  failedSteps?: string[];
  lastError?: string;
  createdAt: Date;
  lastUpdated: Date;
}

interface IncidentPlaybook {
  id: string;
  name: string;
  steps: PlaybookStep[];
}

interface PlaybookStep {
  id: string;
  name: string;
  description: string;
  critical: boolean;
  estimatedDuration: number; // minutes
  actions: string[];
}

enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  IMMEDIATE = 'IMMEDIATE',
}

export {
  SecurityMonitoringService,
  SecurityEventType,
  SecuritySeverity,
  IncidentSeverity,
  AlertPriority,
};
```

---

**This comprehensive Security Framework & Data Protection documentation provides detailed implementation of enterprise-grade security measures including multi-factor authentication, role-based access control, data encryption, and real-time security monitoring specifically designed for the Japanese employment market with comprehensive compliance automation.**

---

*Security implementation follows international standards (ISO 27001, SOC 2) and Japanese regulatory requirements with automated incident response, threat detection, and compliance monitoring capabilities suitable for handling sensitive employment and personal data.*