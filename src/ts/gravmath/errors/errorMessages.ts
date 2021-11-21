enum ErrorMessages {
    ORBIT_A_E_MISMATCH_WITH_CONIC_TYPE = "orbit should be either elliptic with a > 0 and e < 1 or hyperbolic with a < 0 and e > 1, a = {0}, e = {1}",
    INVALID_PARAMETER_RANGE = "invalid parameter {0}: {1} not in range [{2}, {3}]",
    UNABLE_TO_COMPUTE_HYPERBOLIC_ECCENTRIC_ANOMALY = "unable to compute hyperbolic eccentric anomaly from the mean anomaly after {0} iterations",
    ORBIT_ANOMALY_OUT_OF_HYPERBOLIC_RANGE = "true anomaly {0} out of hyperbolic range (e = {1}, {2} < v < {3})",
}